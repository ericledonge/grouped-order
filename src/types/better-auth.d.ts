import { UserRole } from "@/lib/generated/prisma";

declare module "better-auth" {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: User;
  }
}
