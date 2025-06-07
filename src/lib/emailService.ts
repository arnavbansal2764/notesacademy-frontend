import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
  },
});

interface PaymentConfirmationData {
  email: string;
  name: string;
  amount: number;
  currency: string;
  coinsAdded: number;
  newBalance: number;
  paymentId: string;
  isNewUser: boolean;
  loginInstructions?: string;
}

export async function sendPaymentConfirmationEmail(data: PaymentConfirmationData) {
  const {
    email,
    name,
    amount,
    currency,
    coinsAdded,
    newBalance,
    paymentId,
    isNewUser,
    loginInstructions
  } = data;

  const loginSection = isNewUser 
    ? `
      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1976d2; margin-top: 0;">🎉 Welcome to Notes Academy!</h3>
        <p>Your account has been created successfully. Here's how to access your account:</p>
        <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #1976d2;">
          <p><strong>Login Method:</strong></p>
          <p>📧 <strong>Email:</strong> ${email}</p>
          <p>🔑 <strong>Password Setup:</strong> You'll need to set up your password on first login</p>
          <p>🌐 <strong>Login URL:</strong> <a href="${process.env.NEXTAUTH_URL}/login" style="color: #1976d2;">Click here to login</a></p>
        </div>
        <p><em>Note: Since this is your first purchase, you'll be prompted to create a password when you first login.</em></p>
      </div>
    `
    : `
      <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #388e3c; margin-top: 0;">💰 Coins Added to Your Account!</h3>
        <p>Your coins have been successfully added to your existing account.</p>
        <p>🌐 <strong>Login:</strong> <a href="${process.env.NEXTAUTH_URL}/login" style="color: #388e3c;">Access your account</a></p>
      </div>
    `;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation - Notes Academy</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; border-bottom: 3px solid #1976d2; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="color: #1976d2; margin: 0;">Notes Academy</h1>
        <p style="color: #666; margin: 5px 0 0 0;">Payment Confirmation</p>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1976d2; margin-top: 0;">✅ Payment Successful!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for your purchase! Your payment has been processed successfully.</p>
      </div>

      <div style="background-color: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">📄 Payment Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Payment ID:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${paymentId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${currency.toUpperCase()} ${(amount / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Coins Added:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${coinsAdded} coins</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Total Balance:</strong></td>
            <td style="padding: 8px 0;"><strong>${newBalance} coins</strong></td>
          </tr>
        </table>
      </div>

      ${loginSection}

      <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #f57c00; margin-top: 0;">💡 What's Next?</h4>
        <ul style="margin: 10px 0;">
          <li>Use your coins to access premium content</li>
          <li>Download study materials and notes</li>
          <li>Take practice quizzes and tests</li>
          <li>Track your learning progress</li>
        </ul>
      </div>

      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; margin-top: 30px;">
        <p style="color: #666; font-size: 14px;">
          If you have any questions, please contact our support team.<br>
          This is an automated email, please do not reply directly.
        </p>
        <p style="color: #1976d2; font-weight: bold;">Happy Learning! 📚</p>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Notes Institute" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Payment Confirmation - ${coinsAdded} Coins Added to Your Account`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Payment confirmation email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error };
  }
}
