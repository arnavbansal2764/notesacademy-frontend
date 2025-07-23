import prisma from '@/lib/prisma';

const accountsData = [
    // Accounts 1-10 disabled for current month (exhausted)
    { accountId: 'account_1', accessId: '9384c726-a01e-4722-8c8c-c0a809434b04', email: 'notesinstitute@gmail.com', isActive: false },
    { accountId: 'account_2', accessId: '570f0f39-9683-42bb-b80c-132c5051d2fe', email: 'arnavbansal.bt23cse@pec.edu.in', isActive: false },
    { accountId: 'account_3', accessId: '54bfa2b0-8dbb-4e25-b773-837f75df70c0', email: 'paras1201paras@gmail.com', isActive: false },
    { accountId: 'account_4', accessId: '679445ad-55d9-4f62-a903-99ee881561d0', email: 'mocktestninja@gmail.com', isActive: false },
    { accountId: 'account_5', accessId: '071620df-c95c-400e-9156-4bc079592e4d', email: 'notesacademy00@gmail.com', isActive: false },
    { accountId: 'account_6', accessId: '42718117-6055-406a-aebc-551cc3bbb454', email: 'contactnotesacademy@gmail.com', isActive: false },
    { accountId: 'account_7', accessId: '62f153bc-6c99-4bd7-a8e5-2fd0ca5213ae', email: 'pb.parasbansal@gmail.com', isActive: false },
    { accountId: 'account_8', accessId: '5fd7292c-6334-4675-827d-01ed91f4d483', email: 'pbansal.analytics@gmail.com', isActive: false },
    { accountId: 'account_9', accessId: 'e83d5411-9e30-4cc7-ac7c-08516d1f9ef0', email: 'virendermamta@gmail.com', isActive: false },
    { accountId: 'account_10', accessId: '1f89c4ac-6ee0-491a-b039-b1c94a724f49', email: 'vinamratasolutions@gmail.com', isActive: false },
    // Active accounts 11-13
    { accountId: 'account_11', accessId: 'ee1972e6-d4b2-48ec-b0ec-f969fdd726fa', email: 'pb.onlinecourses@gmail.com', isActive: true },
    { accountId: 'account_12', accessId: 'a02b2373-2643-42b7-9ced-c04b9abcb188', email: 'officeseekho@gmail.com', isActive: true },
    { accountId: 'account_13', accessId: '4d97611a-7ef5-4461-b4eb-33cf7fe80afa', email: 'soni.pooja968@gmail.com', isActive: true },
    {
        accountId: 'account_14', accessId: '27be4652-76d2-4c37-add9-eeedf31bc2bd', email: 'main.topperninja@gmail.com', isActive: true
    },
];

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function seedMagicSlidesAccounts() {
    const currentMonth = getCurrentMonth();

    try {
        console.log('Starting MagicSlides accounts seeding...');

        // Get existing account IDs to avoid duplicates
        const existingAccounts = await prisma.magicSlidesAccount.findMany({
            select: { accountId: true }
        });
        const existingAccountIds = new Set(existingAccounts.map(acc => acc.accountId));

        // Filter out accounts that already exist
        const newAccounts = accountsData.filter(account => !existingAccountIds.has(account.accountId));

        if (newAccounts.length === 0) {
            console.log('All accounts already exist. No seeding needed.');
            return { success: true, count: 0, message: 'All accounts already exist' };
        }

        // Create only new accounts
        const createdAccounts = await prisma.magicSlidesAccount.createMany({
            data: newAccounts.map(account => ({
                ...account,
                lastResetMonth: currentMonth,
                currentUsage: 0
            })),
        });

        console.log(`Successfully created ${createdAccounts.count} new MagicSlides accounts`);
        console.log(`Existing accounts: ${existingAccountIds.size}, New accounts: ${createdAccounts.count}`);

        return {
            success: true,
            count: createdAccounts.count,
            existing: existingAccountIds.size,
            message: `Created ${createdAccounts.count} new accounts, ${existingAccountIds.size} already existed`
        };

    } catch (error) {
        console.error('Error seeding MagicSlides accounts:', error);
        return { success: false, error };
    }
}

// Standalone script runner
if (require.main === module) {
    seedMagicSlidesAccounts()
        .then((result) => {
            console.log('Seeding completed:', result);
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}
