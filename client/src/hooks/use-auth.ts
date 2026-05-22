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
  const hasToken = Boolean(token);
  const isAuthenticated = Boolean(token && teacher);

  // Handle route protection
  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = pathname.startsWith("/auth");

    if (requireAuth && !hasToken && !isAuthPage) {
      router.replace("/auth/login");
      return;
    }

    if (requireAuth && hasToken && isError) {
      localStorage.removeItem("te_token");
      localStorage.removeItem("te_teacher");
      queryClient.clear();
      router.replace("/auth/login");
      return;
    }

    if (isAuthenticated && isAuthPage) {
      router.replace("/dashboard");
    }
  }, [hasToken, isAuthenticated, isError, isLoading, pathname, queryClient, requireAuth, router]);

  const loginMutation = useMutation({
    mutationFn: api.auth.login,
    onSuccess: (data) => {
      localStorage.setItem("te_token", data.token);
      localStorage.setItem("te_teacher", JSON.stringify(data.teacher));
      queryClient.setQueryData(["auth-profile"], { teacher: data.teacher });
      router.replace("/dashboard");
    },
  });

  const signupMutation = useMutation({
    mutationFn: api.auth.signup,
    onSuccess: (data) => {
      localStorage.setItem("te_token", data.token);
      localStorage.setItem("te_teacher", JSON.stringify(data.teacher));
      queryClient.setQueryData(["auth-profile"], { teacher: data.teacher });
      router.replace("/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.auth.logout,
    onSettled: () => {
      localStorage.removeItem("te_token");
      localStorage.removeItem("te_teacher");
      queryClient.clear();
      router.replace("/auth/login");
    },
  });

  return {
    teacher,
    hasToken,
    isAuthenticated,
    isLoading: (hasToken && isLoading) || (requireAuth && !isAuthenticated),
    isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    signup: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
    refetchProfile: refetch,
  };
}
