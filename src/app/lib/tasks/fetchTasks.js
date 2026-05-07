"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectTasks } from "@/app/services/tasks.service";

export default function useTasks(projectId, status, search) {
  return useQuery({
    queryKey: ["tasks", projectId],

    queryFn: ({ signal }) =>
      getProjectTasks({
        projectId,
        signal,
      }),

    enabled: !!projectId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,

    select: (res) => {
      const normalizedSearch = search?.trim().toLowerCase();

      return (res?.data || []).filter((task) => {
        const matchesStatus = !status || task.status === status;
        const matchesSearch =
          !normalizedSearch ||
          task.title?.toLowerCase().includes(normalizedSearch);

        return matchesStatus && matchesSearch;
      });
    },
  });
}
