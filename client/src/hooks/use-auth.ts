"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { queryKeys } from "@/lib/query-keys";

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
    queryKey: queryKeys.auth.profile(),
    queryFn: () => api.auth.getProfile(),
    enabled: !!token,
    retry: false,
  });

  const user = profileData?.user;
  const hasToken = Boolean(token);
  const isAuthenticated = Boolean(token && user);
  const role = user?.role as string | undefined;

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
      localStorage.removeItem("te_user");
      queryClient.clear();
      router.replace("/auth/login");
      return;
    }

    if (isAuthenticated && isAuthPage) {
      if (role === 'SUPER_ADMIN') router.replace('/admin');
      else router.replace('/dashboard');
    }
  }, [hasToken, isAuthenticated, isError, isLoading, pathname, queryClient, requireAuth, router, role]);

  const loginMutation = useMutation({
    mutationFn: api.auth.login,
    onSuccess: (data) => {
      localStorage.setItem("te_token", data.token);
      localStorage.setItem("te_user", JSON.stringify(data.user));
      queryClient.setQueryData(queryKeys.auth.profile(), { user: data.user });
      if (data.user?.mustChangePassword) {
        localStorage.setItem('te_must_change_password', '1');
      }
      if (data.user?.role === 'SUPER_ADMIN') router.replace('/admin');
      else router.replace('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.auth.logout,
    onSettled: () => {
      localStorage.removeItem("te_token");
      localStorage.removeItem("te_user");
      localStorage.removeItem('te_must_change_password');
      queryClient.clear();
      router.replace("/auth/login");
    },
  });

  return {
    user,
    teacher: user, // backward compatibility for existing components
    role,
    hasToken,
    isAuthenticated,
    isLoading: (hasToken && isLoading) || (requireAuth && !isAuthenticated),
    isError,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
    refetchProfile: refetch,
  };
}
