"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { UserList } from "@/types";
import { UserTable } from "@/components/users/UserTable";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";

export default function UsersPage() {
  const { user } = useAuth();
  if (user?.role !== "Admin") redirect("/bugs");

  const [userList, setUserList] = useState<UserList | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);
  const { toast } = useToast();

  const fetchUsers = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (search) params.set("search", search);
    setLoading(true);
    api.get<UserList>(`/users?${params}`)
      .then(setUserList)
      .catch(() => toast({ title: "Error", description: "Failed to load users.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [page, search, toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (id: string, role: string) => {
    await api.put(`/users/${id}/role`, { role });
    fetchUsers();
    toast({ title: "Updated", description: "User role updated." });
  };

  const handleDisable = async (id: string, isDisabled: boolean) => {
    await api.put(`/users/${id}/disable`, { isDisabled });
    fetchUsers();
    toast({ title: "Updated", description: `User ${isDisabled ? "disabled" : "enabled"}.` });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input placeholder="Search users..." className="pl-9" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <UserTable users={userList?.items ?? []} onRoleChange={handleRoleChange} onDisable={handleDisable} />
          {userList && userList.totalPages > 1 && (
            <Pagination currentPage={page} totalPages={userList.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
