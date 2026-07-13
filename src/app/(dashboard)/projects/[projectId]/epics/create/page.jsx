"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import toast from "react-hot-toast";
import { required } from "zod/v4-mini";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getProjectMembers } from "@/app/services/members.service";
import { createEpic } from "@/app/services/epics.service";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  user_id: z.string(),
  deadline: z.string().optional(),
});

export default function CreateEpic() {
  const router = useRouter();
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });

 
  const { data: members = [], isLoading: loadingMembers } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId,
    select: (res) => res?.data || res || [],
  });


  const createEpicMutation = useMutation({
    mutationFn: createEpic,
    onSuccess: () => {
      toast.success("Epic created successfully");

      queryClient.invalidateQueries(["epics"]);

      router.push(`/projects/${projectId}/epics`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data) => {
    const requestBody = {
      title: data.title,
      description: data.description || "",
      assignee_id: data.user_id,
      project_id: projectId,
      deadline: data.deadline || null,
    };

    createEpicMutation.mutate(requestBody);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col bg-gray-50 pb-10">
      <div className="flex flex-1 justify-center">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5 p-4 sm:p-6"
          >
            <div>
              <label className="text-xs text-gray-500">Title</label>

              <input
                {...register("title")}
                className="w-full mt-1 bg-[#D7E2FF] rounded-md px-4 py-3 outline-none"
              />

              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-500">
                Description
              </label>

              <textarea
                {...register("description")}
                rows={4}
                className="w-full mt-1 bg-[#D7E2FF] rounded-md px-4 py-3 outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">
                Assignee
              </label>

              <select
                {...register("user_id", required)}
                className="w-full mt-1 bg-[#D7E2FF] rounded-md px-4 py-3 outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  {loadingMembers ? "Loading..." : "Select assignee"}
                </option>

                {!loadingMembers &&
                  members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.metadata?.name || m.email}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500">Deadline</label>

              <input
                type="date"
                {...register("deadline")}
                className="w-full mt-1 bg-[#D7E2FF] rounded-md px-4 py-3 outline-none"
              />
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() =>
                  router.push(`/projects/${projectId}/epics`)
                }
                className="text-gray-500 cursor-pointer"
              >
                Cancel
              </button>

              <button
                disabled={isSubmitting || createEpicMutation.isPending}
                className="bg-[#014CBF] cursor-pointer text-white px-5 py-2 rounded-md hover:bg-blue-600"
              >
                {isSubmitting || createEpicMutation.isPending
                  ? "Creating..."
                  : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
