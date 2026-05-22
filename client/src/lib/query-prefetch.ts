import type { QueryClient } from "@tanstack/react-query";
import { api, type GlobalFilters } from "@/services/api";
import { queryKeys } from "./query-keys";

export const prefetchRouteData = async (
  queryClient: QueryClient,
  route: string,
  filters: Partial<GlobalFilters>
) => {
  if (route === "/dashboard") {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.analytics.dashboard(filters),
      queryFn: () => api.analytics.getDashboard(filters),
      staleTime: 60_000,
    });
    return;
  }

  if (route === "/dashboard/analytics") {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.analytics.grades(filters),
        queryFn: () => api.analytics.getGrades(filters),
        staleTime: 60_000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.analytics.courses(filters),
        queryFn: () => api.analytics.getCourses(filters),
        staleTime: 60_000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.analytics.classes(filters),
        queryFn: () => api.analytics.getClasses(filters),
        staleTime: 60_000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.analytics.trends(filters),
        queryFn: () => api.analytics.getTrends(filters),
        staleTime: 60_000,
      }),
    ]);
    return;
  }

  if (route === "/dashboard/students") {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.students.list({
        className: filters.className,
        year: filters.academicYear,
      }),
      queryFn: () => api.students.list({ className: filters.className, year: filters.academicYear }),
      staleTime: 60_000,
    });
    return;
  }

  if (route === "/dashboard/assignments" || route === "/dashboard/marks") {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.assignments.list({
          className: filters.className,
          year: filters.academicYear,
          courseId: filters.courseId,
        }),
        queryFn: () =>
          api.assignments.list({
            className: filters.className,
            year: filters.academicYear,
            courseId: filters.courseId,
          }),
        staleTime: 60_000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.courses.list({
          className: filters.className,
          year: filters.academicYear,
        }),
        queryFn: () => api.courses.list({ className: filters.className, year: filters.academicYear }),
        staleTime: 5 * 60_000,
      }),
    ]);
    return;
  }

  if (route === "/dashboard/reports") {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.students.list({
        className: filters.className,
        year: filters.academicYear,
      }),
      queryFn: () => api.students.list({ className: filters.className, year: filters.academicYear }),
      staleTime: 60_000,
    });
  }
};
