import { getMembers } from "@/lib/actions/member-actions";
import { requireAdmin } from "@/lib/auth-helpers";
import { MembersTable } from "./members-table";

export default async function MembersPage() {
  // Server-side auth check
  await requireAdmin();

  // Fetch members
  const members = await getMembers();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestion des membres</h1>
        <p className="text-muted-foreground mt-2">
          Liste de tous les membres inscrits sur la plateforme
        </p>
      </div>

      <MembersTable members={members} />
    </div>
  );
}
