"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: Readonly<Props>) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-4 md:px-6 shrink-0">
      <button
        className="md:hidden p-1.5 rounded hover:bg-gray-100"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>
      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium text-gray-700 hidden sm:block">{user?.displayName}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{user?.role}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
