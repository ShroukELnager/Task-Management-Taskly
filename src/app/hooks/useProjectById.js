
import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "@/app/services/projects.service";

export function useProjectById(id) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}