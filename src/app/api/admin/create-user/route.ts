import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const adminSession = await getAdminSession();
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, coins } = body;

    // Validate required fields
    if (!name || !email || coins === undefined) {
      return NextResponse.json(
        { error: 'Name, email, and coins are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate coins is a positive number
    const coinsToAdd = parseInt(coins);
    if (isNaN(coinsToAdd) || coinsToAdd < 0) {
      return NextResponse.json(
        { error: 'Coins must be a valid positive number' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    });
    
    let isNewUser = false;
    
    if (user) {
      // User exists - increment coins
      console.log(`Admin creating coins for existing user: ${user.id} with ${user.coins} coins, adding ${coinsToAdd}`);
      
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          coins: { increment: coinsToAdd },
          name: name // Update name in case it changed
        }
      });
      
      console.log(`Admin updated existing user: ${user.id} now has ${user.coins} coins`);
    } else {
      // User doesn't exist - create new user with coins
      user = await prisma.user.create({
        data: { 
          name: name.trim(),
          email: email.toLowerCase(), 
          password: "", // Empty password for admin-created users
          coins: coinsToAdd
        }
      });
      isNewUser = true;
      console.log(`Admin created new user: ${user.id} (${email}) with ${coinsToAdd} coins`);
    }

    // Send welcome email for new users using existing email service
    if (isNewUser) {
      try {
        await sendWelcomeEmail({
          email: user.email,
          name: user.name || 'User',
          coinsAdded: coinsToAdd,
          newBalance: user.coins,
          isNewUser: true
        });
        console.log(`Welcome email sent to ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the user creation for email issues
      }
    }

    return NextResponse.json({
      success: true,
      message: isNewUser ? 'User created successfully' : 'User coins updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        coins: user.coins,
        isNewUser,
        coinsAdded: coinsToAdd
      }
    });

  } catch (error) {
    console.error('Admin create user error:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
