import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/rob/admin");
  }

  const forms = await db.form.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Gerenciador de Formulários</h1>
          <p className="text-muted-foreground text-sm mt-1">Área Restrita - Rob Dev</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{session.user?.name}</span>
          <a href="/api/auth/signout" className="text-sm text-red-500 hover:underline">Sair</a>
        </div>
      </div>
      <AdminDashboard initialForms={forms} />
    </div>
  );
}
