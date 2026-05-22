"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const token = typeof window !== "undefined" ? localStorage.getItem("te_token") : null;

  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["auth-profile"],
    queryFn: () => api.auth.getProfile(),
    enabled: !!token,
    retry: false,
  });

  const teacher = profileData?.teacher;

  // Handle route protection
  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname.startsWith("/auth");

    if (requireAuth && !token && !isAuthPage) {
      router.push("/auth/login");
    } else if (token && isAuthPage) {
      router.push("/dashboard");
    }
  }, [token, pathname, isLoading, requireAuth, router]);

  const loginMutation = useMutation({
    mutationFn: api.auth.login,
    onSuccess: (data) => {
      localStorage.setItem("te_token", data.token);
      localStorage.setItem("te_teacher", JSON.stringify(data.teacher));
      queryClient.setQueryData(["auth-profile"], { teacher: data.teacher });
      router.push("/dashboard");
    },
  });

  const signupMutation = useMutation({
    mutationFn: api.auth.signup,
    onSuccess: (data) => {
      localStorage.setItem("te_token", data.token);
      localStorage.setItem("te_teacher", JSON.stringify(data.teacher));
      queryClient.setQueryData(["auth-profile"], { teacher: data.teacher });
      router.push("/dashboard");
    },
  });

  const logout = () => {
    localStorage.removeItem("te_token");
    localStorage.removeItem("te_teacher");
    queryClient.clear();
    router.push("/auth/login");
  };

  return {
    teacher,
    isLoading: !!token && isLoading,
    isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    signup: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    logout,
    refetchProfile: refetch,
  };
}
