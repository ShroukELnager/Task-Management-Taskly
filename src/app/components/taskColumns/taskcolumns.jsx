"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TaskDetailsModal from "@/app/(dashboard)/projects/[projectId]/tasks/modal";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "../taskCart";
import { useDebounce } from "@/app/hooks/useDebounce";
import useTasks from "@/app/lib/tasks/fetchTasks";

export default function TaskColumn({ status, projectId, search }) {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  // ✅ debounce search
  const debouncedSearch = useDebounce(search, 400);

  // ✅ هنا الصح: استخدام hook مباشرة
  const {
    data: tasks = [],
    isLoading: loading,
    isError,
  } = useTasks(projectId, status, debouncedSearch);

  const STATUS_STYLES = {
    TO_DO: "bg-gray-400 text-gray-600",
    IN_PROGRESS: "bg-blue-500 text-blue-600",
    BLOCKED: "bg-red-500 text-red-600",
    IN_REVIEW: "bg-purple-500 text-purple-600",
    READY_FOR_QA: "bg-yellow-500 text-yellow-600",
    REOPENED: "bg-orange-500 text-orange-600",
    READY_FOR_PRODUCTION: "bg-indigo-500 text-indigo-600",
    DONE: "bg-green-500 text-green-600",
  };

  const { setNodeRef } = useDroppable({
    id: status,
  });

  // =========================
  // CREATE TASK
  // =========================
  const goToCreate = () => {
    router.push(
      `/projects/${projectId}/tasks/create?status=${encodeURIComponent(status)}`
    );
  };

  const openTask = (taskId) => {
    setSelectedTaskId(taskId);
    setIsOpen(true);
  };

  return (
    <div ref={setNodeRef} className="w-[270px] shrink-0 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
          <span
            className={`w-2 h-2 rounded-full ${
              STATUS_STYLES[status]?.split(" ")[0]
            }`}
          />
          {status}

          <span className="bg-gray-200 px-2 py-0.5 rounded text-[10px]">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={goToCreate}
          className="w-7 h-7 flex items-center justify-center rounded-md 
                     bg-gray-100 hover:bg-gray-200 text-lg font-bold"
        >
          +
        </button>
      </div>

      {/* ADD TASK */}
      <div
        onClick={goToCreate}
        className="border border-dashed rounded-lg py-3 
                   flex items-center justify-center gap-2 
                   text-xs text-gray-400 mb-3 cursor-pointer 
                   hover:bg-gray-50 transition"
      >
        <Image src="/images/Cplus.png" width={16} height={16} alt="Add Task" />
        <span className="font-medium">ADD NEW TASK</span>
      </div>

      {/* TASKS */}
      {loading ? (
        <div className="text-xs text-gray-400">Loading...</div>
      ) : isError ? (
        <div className="text-xs text-red-500">Error loading tasks</div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id ?? task.task_id}
              task={task}
              openTask={openTask}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      <TaskDetailsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        taskId={selectedTaskId}
        projectId={projectId}
      />
    </div>
  );
}
