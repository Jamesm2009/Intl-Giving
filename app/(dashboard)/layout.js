import NavTabs from "@/components/NavTabs";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardLayout({ children }) {
  return (
    <div className="app-shell">
      <div className="topbar">
        <div>
          <h1>International Giving into USA</h1>
          <div className="sub">Interactive Dashboard &mdash; 2020&ndash;2026</div>
        </div>
        <LogoutButton />
      </div>
      <NavTabs />
      <main className="content">{children}</main>
    </div>
  );
}
