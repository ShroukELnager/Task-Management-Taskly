"use client";

import { useQuery } from "@tanstack/react-query";
import { getTaskDetails } from "@/app/services/tasks.service";

export function useTaskDetails({ projectId, taskId }) {
  return useQuery({
    queryKey: ["task", projectId, taskId],

    queryFn: () =>
      getTaskDetails({
        projectId,
        taskId,
      }),

    enabled: !!projectId && !!taskId,

    staleTime: 1000 * 60 * 5, 
  });
}