"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import SkeletonCard from "@/app/components/skeleton/projects";
import EpicsError from "@/app/components/errorsPages/epics";
import EmptyProjects from "@/app/components/emptyPages/project";
import Pagination from "@/app/components/paginations";

export default function Projects() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const limit = 5;

  const fetchProjects = async ({ pageParam = 1 }) => {
    const offset = (pageParam - 1) * limit;

    const res = await fetch(
      `/api/projects?limit=${limit}&offset=${offset}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch projects");
    }

    const result = await res.json();

    return {
      data: result?.data ?? [],
      totalCount: Number(result?.totalCount ?? 0),
      nextPage: pageParam + 1,
    };
  };

  const {
    data,
    error,
    isLoading,

  } = useInfiniteQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,

    getNextPageParam: (lastPage, pages) => {
      const loadedItems = pages.flatMap((p) => p.data).length;

      if (loadedItems < lastPage.totalCount) {
        return lastPage.nextPage;
      }

      return undefined;
    },
  });

const projects = Array.from(
  new Map(data?.pages?.flatMap(p => p.data).map(p => [p.id, p])).values()
);
  const totalCount =
    data?.pages?.[0]?.totalCount ?? 0;

  return (
    <div className="min-h-full bg-gray-50 pb-24 sm:pb-10">
      <div className="mx-auto w-full max-w-[1500px]">

        <div className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
          <div className="text-center sm:text-left w-full">
            <h1 className="text-2xl font-semibold sm:text-3xl">Projects</h1>
            <p className="text-gray-600 text-sm">
              Manage and create your projects
            </p>
          </div>

          <button
            onClick={() => router.push("/projects/create")}
            className="hidden cursor-pointer sm:flex bg-[#014CBF] text-white py-2 px-4 rounded-md hover:bg-blue-600 items-center gap-2 whitespace-nowrap"
          >
            <Image src="/images/plus.svg" alt="plus" width={16} height={16} />
            <p className="text-sm font-medium whitespace-nowrap">
              Create Project
            </p>
          </button>
        </div>

        {error && (
          <div className="p-4">
            <EpicsError
              fetchEpics={() =>
                queryClient.invalidateQueries({ queryKey: ["projects"] })
              }
            />
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {[...Array(limit)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!isLoading && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <EmptyProjects />
          </div>
        )}

        {!isLoading && !error && projects.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 pb-20 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

              {projects.map((project) => (
                <div
                  key={`${project.id}`}
                  onClick={() =>
                    router.push(`/projects/${project.id}/epics`)
                  }
                  className="min-h-[190px] cursor-pointer rounded-lg bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <h2 className="text-lg font-semibold text-gray-900">
                    {project.name || "Untitled Project"}
                  </h2>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                    {project.description || "No description available"}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/projects/${project.id}/edit`);
                    }}
                    className="mt-4 cursor-pointer text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md transition"
                  >
                    Edit
                  </button>

                  <div className="mt-6 flex justify-between items-center text-xs text-gray-400">
                    <span>CREATED AT</span>
                    <span>
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex min-h-[190px] cursor-pointer flex-col justify-between rounded-lg border border-dashed bg-white p-5 transition hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md">
                <div
                  onClick={() => router.push("/projects/create")}
                  className="flex flex-col items-center justify-center h-full text-center text-gray-500"
                >
                  <div className="w-[40px] h-[40px] bg-[#E5EEFA] rounded-lg flex items-center justify-center">
                    <Image
                      src="/images/add.svg"
                      alt="plus"
                      width={24}
                      height={24}
                    />
                  </div>

                  <p className="text-sm mt-2">Add Project</p>
                </div>
              </div>
            </div>

            <div className="hidden pb-20 sm:block">
              <Pagination
                currentPage={1}
                totalCount={totalCount}
                limit={limit}
                onPageChange={() => {}}
                label="projects"
              />
            </div>

      
          </>
        )}
      </div>

      <button
        onClick={() => router.push("/projects/create")}
        className="sm:hidden cursor-pointer fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-[#014CBF] text-white shadow-lg hover:bg-blue-600 transition z-50"
      >
        <Image src="/images/plus.svg" alt="plus" width={20} height={20} />
      </button>
    </div>
  );
}
