import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AgentsManager } from "@/components/admin/AgentsManager";

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/leady/login");
  }
  // @ts-expect-error session.user.role
  const role: string | undefined = session.user.role;
  if (role !== "ADMIN") {
    redirect("/leady");
  }

  const users = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  return (
    <div className="max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Spravovať agentov</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Pridaj alebo deaktivuj používateľov ktorí majú prístup do{" "}
          <code className="text-xs px-1.5 py-0.5 rounded bg-zinc-100">
            /leady
          </code>{" "}
          Lead Software.
        </p>
      </header>

      <AgentsManager initialUsers={users} />
    </div>
  );
}
