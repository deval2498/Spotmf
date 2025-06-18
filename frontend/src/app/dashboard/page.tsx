import { LeftSidebar } from "./components/LeftSidebar";
import { MainSection } from "./components/MainSection";
export default function Dashboard() {
  return (
    <div className="dark-pink-gradient">
      <div className="flex h-screen p-2 overflow-y-auto">
        <LeftSidebar />
        <MainSection />
      </div>
    </div>
  );
}
