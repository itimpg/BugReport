"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { Bug } from "lucide-react";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Bug className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bug Report System</h1>
          <p className="text-gray-500 text-sm">Track and manage bug reports efficiently</p>
        </div>
        <GoogleLoginButton />
        <p className="text-xs text-gray-400">By signing in you agree to our Terms of Service</p>
      </div>
    </div>
  );
}
