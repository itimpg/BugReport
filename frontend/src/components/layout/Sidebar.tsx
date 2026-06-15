"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Bug, LayoutDashboard, Tag, Users } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard",    icon: LayoutDashboard, adminOnly: true },
  { href: "/bugs",      label: "Bug Reports",   icon: Bug,             adminOnly: false },
  { href: "/categories",label: "Categories",    icon: Tag,             adminOnly: true },
  { href: "/users",     label: "Users",         icon: Users,           adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = navItems.filter((i) => !i.adminOnly || user?.role === "Admin");

  return (
    <aside className="w-56 bg-white border-r flex flex-col h-full shrink-0">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg"><Bug className="text-white w-5 h-5" /></div>
          <span className="font-bold text-gray-900 text-sm">BugReport</span>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const Icon    = item.icon;
          const active  = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
