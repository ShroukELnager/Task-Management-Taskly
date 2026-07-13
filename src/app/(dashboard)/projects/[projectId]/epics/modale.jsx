"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TaskDetailsModal from "../tasks/modal";
import EpicModalSkeleton from "@/app/components/skeleton/epicModalSkeleton";
import { useDebounce } from "@/app/hooks/useDebounce";
import { getEpicById, updateEpic } from "@/app/services/epics.service";
import { getProjectMembers } from "@/app/services/members.service";
import { getProjectTasks } from "@/app/services/tasks.service";

export default function EpicDetailsModal({
  isOpen,
  onClose,
  epicId,
  projectId,
  onUpdateEpic,
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const lastSentValues = useRef({});
  const isFormReadyRef = useRef(false);

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee_id: "",
    created_at: "",
    deadline: "",
  });

  const epicQueryKey = ["epic", projectId, epicId];

  const {
    data: epic,
    isLoading: loadingEpic,
    isError: isEpicError,
    error: epicError,
  } = useQuery({
    queryKey: epicQueryKey,
    queryFn: () => getEpicById({ projectId, id: epicId }),
    enabled: isOpen && !!projectId && !!epicId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => getProjectMembers(projectId),
    enabled: isOpen && !!projectId,
    select: (res) => res?.data || [],
  });

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery({
    queryKey: ["tasks", projectId, "epic", epicId],
    queryFn: () => getProjectTasks({ projectId, epicId }),
    enabled: isOpen && !!projectId && !!epicId,
    select: (res) => res?.data || [],
  });

  const updateEpicMutation = useMutation({
    mutationFn: ({ field, value }) => updateEpic(epicId, { [field]: value }),
    onMutate: ({ field, value }) => {
      setUpdateError("");

      queryClient.setQueryData(epicQueryKey, (old) =>
        old ? { ...old, [field]: value } : old
      );

      return { field, value };
    },
    onSuccess: (res, variables) => {
      const updatedEpic = res?.data?.[0] || {
        ...epic,
        [variables.field]: variables.value,
      };

      lastSentValues.current[variables.field] = variables.value;
      queryClient.setQueryData(epicQueryKey, updatedEpic);
      queryClient.invalidateQueries({ queryKey: ["epics", projectId] });

      if (onUpdateEpic) {
        onUpdateEpic(updatedEpic);
      }
    },
    onError: (err) => {
      setUpdateError(err?.message || "Failed to update epic");
      queryClient.invalidateQueries({ queryKey: epicQueryKey });
    },
  });
  const { mutate: mutateEpic } = updateEpicMutation;

  const normalizeFieldValue = useCallback((field, value) => {
    if ((field === "deadline" || field === "assignee_id") && value === "") {
      return null;
    }

    return value;
  }, []);

  useEffect(() => {
    if (!epic) return;

    isFormReadyRef.current = false;

    const timeout = setTimeout(() => {
      const nextFormData = {
        title: epic.title || "",
        description: epic.description || "",
        assignee_id: epic.assignee_id || "",
        created_at: epic.created_at?.split("T")[0] || "",
        deadline: epic.deadline?.split("T")[0] || "",
      };

      lastSentValues.current = {
        title: nextFormData.title,
        description: nextFormData.description,
        assignee_id: normalizeFieldValue(
          "assignee_id",
          nextFormData.assignee_id
        ),
        deadline: normalizeFieldValue("deadline", nextFormData.deadline),
      };

      setFormData(nextFormData);
      isFormReadyRef.current = true;
    }, 0);

    return () => clearTimeout(timeout);
  }, [epic, normalizeFieldValue]);

  const openTask = (taskId) => {
    setSelectedTaskId(taskId);
    setIsTaskOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return "UN";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleUpdate = useCallback(
    (field, value) => {
      if (!epicId || !epic || !isFormReadyRef.current) return;

      const normalizedValue = normalizeFieldValue(field, value);
      const currentValue = normalizeFieldValue(field, epic?.[field] ?? null);

      if (currentValue === normalizedValue) return;
      if (lastSentValues.current[field] === normalizedValue) return;

      mutateEpic({ field, value: normalizedValue });
    },
    [epic, epicId, mutateEpic, normalizeFieldValue]
  );

  const debouncedTitle = useDebounce(formData.title);
  const debouncedDescription = useDebounce(formData.description);
  const debouncedAssignee = useDebounce(formData.assignee_id);
  const debouncedDate = useDebounce(formData.deadline);

  useEffect(() => {
    if (debouncedTitle !== formData.title) return;
    handleUpdate("title", debouncedTitle);
  }, [debouncedTitle, formData.title, handleUpdate]);

  useEffect(() => {
    if (debouncedDescription !== formData.description) return;
    handleUpdate("description", debouncedDescription);
  }, [debouncedDescription, formData.description, handleUpdate]);

  useEffect(() => {
    if (debouncedAssignee !== formData.assignee_id) return;
    handleUpdate("assignee_id", debouncedAssignee);
  }, [debouncedAssignee, formData.assignee_id, handleUpdate]);

  useEffect(() => {
    if (debouncedDate !== formData.deadline) return;
    handleUpdate("deadline", debouncedDate);
  }, [debouncedDate, formData.deadline, handleUpdate]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
    >
      <div className="w-full sm:max-w-3xl sm:px-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full h-[95vh] sm:h-auto rounded-t-2xl sm:rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-5 sm:p-6 relative">
            <button onClick={onClose} className="absolute right-5 top-5">
              <Image
                src="/images/close.png"
                width={18}
                height={18}
                alt="close"
              />
            </button>

            {loadingEpic ? (
              <EpicModalSkeleton />
            ) : isEpicError ? (
              <p className="text-center py-10 text-red-500">
                {epicError?.message || "Failed to load epic"}
              </p>
            ) : epic ? (
              <>
                {updateError && (
                  <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                    {updateError}
                  </p>
                )}

                <div className="mb-6">
                  <p className="text-xs font-semibold text-blue-600 mb-1">
                    {epic.epic_id}
                  </p>

                  <input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, title: e.target.value }))
                    }
                    className="text-xl font-semibold w-full outline-none"
                  />
                </div>

                <div className="mb-6">
                  <p className="text-xs text-gray-400 uppercase mb-1">
                    Description
                  </p>

                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="text-sm text-gray-600 w-full outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 mb-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-3">
                      Created By
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        {epic.created_by?.name?.slice(0, 2).toUpperCase() ||
                          "-"}
                      </div>

                      <p className="text-sm text-gray-800">
                        {epic.created_by?.name || "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-2">
                      Deadline
                    </p>

                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          deadline: e.target.value,
                        }))
                      }
                      className="text-sm outline-none bg-transparent"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-3">
                      Assignee
                    </p>

                    <select
                      value={formData.assignee_id}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          assignee_id: e.target.value,
                        }))
                      }
                      className="text-sm outline-none bg-transparent w-full"
                    >
                      {members.map((m) => (
                        <option key={m.user_id} value={m.user_id}>
                          {m.metadata?.name || m.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-2">
                      Created At
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      <Image
                        src="/images/date.png"
                        width={16}
                        height={16}
                        alt="created at"
                      />

                      {epic.created_at &&
                        new Date(epic.created_at)
                          .toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })
                          .replace(",", "")}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Tasks</h3>
                  <span className="text-xs text-gray-500">
                    {tasks.length} TASKS
                  </span>
                </div>

                <div className="rounded-xl max-h-[160px] overflow-y-auto">
                  {tasksLoading ? (
                    <p className="text-center py-6">Loading tasks...</p>
                  ) : tasksError ? (
                    <p className="text-center py-6 text-red-500">
                      Failed to load tasks
                    </p>
                  ) : tasks.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50">
                      <div className="bg-blue-100 p-2 rounded-md w-fit mx-auto mb-4">
                        <Image
                          src="/images/menu.png"
                          width={20}
                          height={20}
                          alt="no tasks"
                        />
                      </div>

                      <p className="text-gray-500 text-sm">
                        No tasks found for this epic
                      </p>

                      <button
                        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md"
                        onClick={() =>
                          router.push(
                            `/projects/${projectId}/tasks/create?epicId=${epicId}`
                          )
                        }
                      >
                        + Add Task
                      </button>
                    </div>
                  ) : (
                    <div>
                      {tasks.map((task) => (
                        <div
                          key={task.id ?? task.task_id}
                          onClick={() => openTask(task.id)}
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                        >
                          <div className="flex items-start gap-3">
                            <Image
                              src="/images/checkedTask.png"
                              width={22}
                              height={22}
                              alt="checkbox"
                              className="mt-1"
                            />

                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {task.title}
                              </p>

                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-semibold">
                                  {getInitials(task.assignee?.name || "")}
                                </div>

                                <span className="text-xs text-gray-500">
                                  {task.assignee?.name || "Unassigned"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase">
                              Due Date
                            </p>

                            <p className="text-xs text-gray-700">
                              {formatDate(task.due_date)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center py-10">No Data</p>
            )}
          </div>
        </div>
      </div>

      <TaskDetailsModal
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        taskId={selectedTaskId}
        projectId={projectId}
      />
    </div>
  );
}
