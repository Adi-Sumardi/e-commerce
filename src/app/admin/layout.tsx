import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminSessionProvider } from "@/components/admin/admin-session-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSessionProvider>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </AdminSessionProvider>
  );
}
