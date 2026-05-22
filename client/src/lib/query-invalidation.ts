import type { QueryClient } from "@tanstack/react-query";
import type { GlobalFilters } from "@/services/api";
import { queryKeys } from "./query-keys";

type PartialAnalyticsFilters = Partial<GlobalFilters>;

export const invalidateAnalyticsQueries = async (
  queryClient: QueryClient,
  filters?: PartialAnalyticsFilters
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
    filters
      ? queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dashboard(filters) })
      : Promise.resolve(),
  ]);
};

export const invalidateStudentQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
};

export const invalidateMarksQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: queryKeys.marks.all });
};

export const invalidateAssignmentsQueries = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.courses.all }),
  ]);
};

export const invalidateReportsQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
};
