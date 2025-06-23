import { LeftSidebar } from "../components/LeftSidebar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen p-2">
      <div className="flex-1">
        <LeftSidebar />
      </div>
      <div className="flex-2/3 overflow-y-scroll">{children}</div>
    </div>
  );
}
