import { useQuery, useMutation } from "@tanstack/react-query";
import { getProjectById, updateProject } from "@/app/services/projects.service";

export function useProject(id) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id),
    enabled: !!id,
  });
}

export function useUpdateProject() {
  return useMutation({
    mutationFn: updateProject,
  });
}