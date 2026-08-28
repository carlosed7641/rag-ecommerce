import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { UserRoleToggle } from "@/components/admin/UserRoleToggle";

export default async function AdminUsersPage() {
  const admin = createAdminClient();
  const supabase = await createClient();

  const [{ data: authUsers }, { data: profiles }, { data: currentUser }] =
    await Promise.all([
      admin.auth.admin.listUsers(),
      supabase.from("profiles").select("id, full_name, role"),
      supabase.auth.getUser(),
    ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const users = (authUsers?.users ?? [])
    .map((u) => ({
      id: u.id,
      email: u.email ?? "—",
      fullName: profileById.get(u.id)?.full_name ?? "—",
      role: profileById.get(u.id)?.role ?? "customer",
      createdAt: u.created_at,
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div>
      <h1 className="mb-8 text-2xl font-extrabold text-ink">Usuarios</h1>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line bg-surface text-left text-xs font-medium uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-ink">{u.fullName}</td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      u.role === "admin"
                        ? "rounded-full bg-copper/10 px-2.5 py-1 text-xs font-semibold text-copper"
                        : "rounded-full bg-muted/10 px-2.5 py-1 text-xs font-semibold text-muted"
                    }
                  >
                    {u.role === "admin" ? "Admin" : "Cliente"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <UserRoleToggle
                    userId={u.id}
                    role={u.role as "customer" | "admin"}
                    isSelf={u.id === currentUser.user?.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
