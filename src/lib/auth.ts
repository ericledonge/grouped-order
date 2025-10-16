import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { PrismaClient, UserRole } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// List of admin emails - users with these emails should have ADMIN role
export const ADMIN_EMAILS =
  process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];

/**
 * Check if an email should have admin privileges
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.MEMBER,
        input: false, // Don't allow users to set this directly
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Check if this is a sign-up, sign-in, or OAuth callback
      const isAuthPath =
        ctx.path.startsWith("/sign-up") ||
        ctx.path.startsWith("/sign-in") ||
        ctx.path.includes("/callback");

      if (isAuthPath && ctx.context.newSession) {
        const user = ctx.context.newSession.user;
        if (user?.email && isAdminEmail(user.email)) {
          // Promote to admin if email is in the admin list
          await prisma.user.update({
            where: { id: user.id },
            data: { role: UserRole.ADMIN },
          });
          console.log(`✨ Auto-promoted to ADMIN: ${user.email}`);
        }
      }
    }),
  },
  plugins: [
    admin({
      defaultRole: UserRole.MEMBER,
      adminRoles: [UserRole.ADMIN],
    }),
    nextCookies(),
  ],
});
