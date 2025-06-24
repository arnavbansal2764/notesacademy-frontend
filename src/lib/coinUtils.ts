import prisma from "@/lib/prisma";

export const FEATURE_COSTS = {
  MCQ: 1,
  SUBJECTIVE: 1,
  MINDMAP: 1,
  SHORT_NOTES: 1,
  PPT : 2
} as const;

export type FeatureType = keyof typeof FEATURE_COSTS;

export async function checkAndDeductCoins(
  userId: string, 
  feature: FeatureType
): Promise<{ success: boolean; message: string; remainingCoins?: number }> {
  try {
    const cost = FEATURE_COSTS[feature];
    
    // Get current user coins
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (user.coins < cost) {
      return { 
        success: false, 
        message: `Insufficient coins. You need ${cost} coin(s) but have ${user.coins}.` 
      };
    }

    // Deduct coins
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { coins: user.coins - cost },
      select: { coins: true }
    });

    return { 
      success: true, 
      message: `${cost} coin(s) deducted successfully`, 
      remainingCoins: updatedUser.coins 
    };
  } catch (error) {
    console.error("Error in checkAndDeductCoins:", error);
    return { success: false, message: "Failed to process coin transaction" };
  }
}

export async function getUserCoins(userId: string): Promise<number | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true }
    });
    
    return user?.coins ?? null;
  } catch (error) {
    console.error("Error getting user coins:", error);
    return null;
  }
}

export async function addCoins(
  userId: string, 
  amount: number
): Promise<{ success: boolean; message: string; newBalance?: number }> {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { coins: { increment: amount } },
      select: { coins: true }
    });

    return { 
      success: true, 
      message: `${amount} coin(s) added successfully`, 
      newBalance: updatedUser.coins 
    };
  } catch (error) {
    console.error("Error adding coins:", error);
    return { success: false, message: "Failed to add coins" };
  }
}
