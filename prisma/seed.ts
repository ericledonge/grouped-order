import { PrismaClient, UserRole } from "../src/lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Get admin emails from environment
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ||
    [];

  if (adminEmails.length === 0) {
    console.log("⚠️  No ADMIN_EMAILS configured in environment.");
    console.log(
      "   Admins will need to sign up normally and be promoted via ADMIN_EMAILS env var.",
    );
    console.log("\n🎉 Seed completed!");
    return;
  }

  console.log(
    `📧 Found ${adminEmails.length} admin email(s) in configuration:`,
  );
  for (const email of adminEmails) {
    console.log(`   - ${email}`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`   ✅ User already exists`);
      console.log(`      Current role: ${existingUser.role}`);

      // Update to admin if not already
      if (existingUser.role !== UserRole.ADMIN) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role: UserRole.ADMIN },
        });
        console.log(`      ✨ Updated role to ADMIN`);
      }
    } else {
      console.log(
        `   ⏩ User not found - will be promoted to ADMIN on first login`,
      );
    }
  }

  console.log(
    "\n💡 Note: Users with admin emails will be auto-promoted to ADMIN",
  );
  console.log("   when they sign up or login via Better Auth.");
  console.log("\n🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
