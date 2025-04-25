import { Sidebar } from "@/app/components/sidebar/Sidebar";
import { Header } from "@/app/components/header/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-72">
        <Header />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
