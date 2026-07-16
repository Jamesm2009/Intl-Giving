"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Overview" },
  { href: "/transactions", label: "Transactions" },
  { href: "/regions", label: "Regions" },
  { href: "/yoy", label: "Year-on-Year" },
  { href: "/fund-code", label: "By Fund Code" },
  { href: "/country", label: "By Country" },
  { href: "/retention", label: "Retention" },
  { href: "/campaigns", label: "Campaigns" },
];

export default function NavTabs() {
  const pathname = usePathname();
  return (
    <nav className="tabs">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={"tab-link" + (pathname === t.href ? " active" : "")}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
