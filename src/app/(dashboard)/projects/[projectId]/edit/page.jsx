"use client";

import Image from "next/image";
import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { useProject, useUpdateProject } from "@/app/hooks/useProject";

export default function EditProjectPage() {
  const router = useRouter();
  const { projectId } = useParams();

  const { data, isLoading } = useProject(projectId);
  const { mutate: updateProjectMutate, isPending } = useUpdateProject();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ mode: "onSubmit" });

  const description = watch("description") || "";

  // fill form when data arrives
  useEffect(() => {
    if (data) {
      setValue("name", data.name);
      setValue("description", data.description);
    }
  }, [data, setValue]);

  const onSubmit = (formData) => {
    updateProjectMutate(
      { id: projectId, data: formData },
      {
        onSuccess: () => {
          toast.success("Project updated successfully");
          router.push("/projects");
        },
        onError: () => {
          toast.error("Failed to update project");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <p>Loading project...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col bg-gray-50 pb-10">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-semibold sm:text-3xl">Edit Project</h1>
      </div>

      <div className="flex flex-1 justify-center">
        <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5 p-4 sm:p-6"
          >
            {/* header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E5EEFA]">
                <Image
                  src="/images/projIcon.svg"
                  alt="project"
                  width={20}
                  height={20}
                />
              </div>

              <div>
                <h1 className="font-semibold text-lg">
                  Edit Project Details
                </h1>
                <p className="text-gray-600 text-sm">
                  Update your project information
                </p>
              </div>
            </div>

            {/* name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Project name</label>
              <input
                {...register("name", { required: "Name is required" })}
                className={`bg-[#D7E2FF] rounded-md px-4 py-3 outline-none ${
                  errors.name ? "border border-red-500" : ""
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* description */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">Description</label>
              <textarea
                {...register("description")}
                rows={5}
                maxLength={500}
                className="bg-[#D7E2FF] rounded-md px-4 py-3 resize-none outline-none"
              />
              <p className="text-xs text-gray-500 text-right">
                {description.length}/500
              </p>
            </div>

            {/* buttons */}
            <div className="mt-3 flex justify-between">
              <button
                type="button"
                onClick={() => router.push("/projects")}
                className="text-gray-500"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="bg-[#014CBF] text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}