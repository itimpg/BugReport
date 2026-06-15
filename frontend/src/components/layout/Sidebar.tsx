"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Bug, LayoutDashboard, Tag, Users, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard, adminOnly: true  },
  { href: "/bugs",       label: "Bug Reports", icon: Bug,             adminOnly: false },
  { href: "/categories", label: "Categories",  icon: Tag,             adminOnly: true  },
  { href: "/users",      label: "Users",       icon: Users,           adminOnly: true  },
];

export function Sidebar({ open, onClose }: Readonly<Props>) {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = navItems.filter((i) => !i.adminOnly || user?.role === "Admin");

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          role="presentation"
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
        />
      )}

      <aside
        className={cn(
          // Base: fixed overlay for mobile
          "fixed top-0 left-0 h-full w-64 z-50 bg-white border-r flex flex-col transition-transform duration-200 ease-in-out",
          // Mobile: slide in/out
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop: static, always visible, narrower
          "md:static md:w-56 md:translate-x-0 md:z-auto md:shrink-0"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Bug className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 text-sm">BugReport</span>
          </div>
          <button
            className="md:hidden p-1 rounded hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {items.map((item) => {
            const Icon   = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
