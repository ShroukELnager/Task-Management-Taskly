"use client";

import { useEffect, useState } from "react";
import TaskDetailsSkeleton from "@/app/components/skeleton/taskDetailsSkeleton";
import { useQueryClient } from "@tanstack/react-query";

import { getTaskDetails, updateTask } from "@/app/services/tasks.service";
import { getProjectMembers } from "@/app/services/members.service";

export default function TaskDetailsModal({
  isOpen,
  onClose,
  projectId,
  taskId,
}) {
  const [task, setTask] = useState(null);
  const [localTask, setLocalTask] = useState(null);
  const [originalTask, setOriginalTask] = useState(null);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const queryClient = useQueryClient();

  const statuses = [
    "TO_DO",
    "IN_PROGRESS",
    "DONE",
    "BLOCKED",
    "IN_REVIEW",
    "READY_FOR_QA",
  ];
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);

        const data = await getTaskDetails({ projectId, taskId });
        const membersRes = await getProjectMembers(projectId);

        setTask(data);
        setLocalTask(data);
        setOriginalTask(data);
        setMembers(membersRes?.data || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, projectId, taskId]);

  const getChangedFields = () => {
    if (!originalTask || !localTask) return {};

    const fields = [
      "title",
      "description",
      "status",
      "due_date",
      "assignee_id",
    ];

    const changes = {};

    fields.forEach((field) => {
      const originalValue =
        field === "assignee_id"
          ? originalTask.assignee?.id || null
          : originalTask[field];

      const currentValue =
        field === "assignee_id"
          ? localTask.assignee?.id || null
          : localTask[field];

      if (originalValue !== currentValue) {
        changes[field] = currentValue;
      }
    });

    return changes;
  };

  const handleClose = async () => {
    try {
      const changes = getChangedFields();

      if (Object.keys(changes).length > 0) {
        await updateTask(taskId, changes);
      }

      const fresh = await getTaskDetails({ projectId, taskId });

      setTask(fresh);
      setLocalTask(fresh);
      setOriginalTask(fresh);

      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
        exact: false,
      });
    } catch (err) {
      console.error("sync error", err);
    }

    onClose(); 
  };
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, handleClose]);

  const handleUpdate = (field, value) => {
    setLocalTask((p) => ({ ...p, [field]: value }));
  };

  if (!isOpen) return null;

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    const s = status?.toUpperCase();
    if (s === "TO_DO") return "bg-gray-200 text-gray-700";
    if (s === "IN_PROGRESS") return "bg-blue-200 text-blue-700";
    if (s === "DONE") return "bg-green-200 text-green-700";
    if (s === "BLOCKED") return "bg-red-200 text-red-700";
    if (s === "IN_REVIEW") return "bg-purple-200 text-purple-700";
    if (s === "READY_FOR_QA") return "bg-yellow-200 text-yellow-800";
    return "bg-gray-100 text-gray-600";
  };

  const getInitials = (name = "") => {
    const parts = name.split(" ");
    if (parts.length === 1) return name.slice(0, 2).toUpperCase();
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  };

  return (
    <>
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />

      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        className="fixed inset-0 z-50 flex items-start md:items-center justify-center overflow-y-auto p-4 md:p-0"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full md:w-[900px] max-h-[90vh] bg-white md:rounded-xl rounded-2xl shadow-xl overflow-hidden"
        >
          {loading ? (
            <TaskDetailsSkeleton />
          ) : error ? (
            <div className="p-6 text-red-500 text-center">
              Failed to load task details
            </div>
          ) : !localTask ? (
            <div className="p-6 text-center">Task not found</div>
          ) : (
            <div className="overflow-y-auto max-h-[90vh]">
              <div className="hidden md:grid grid-cols-3">
                <div className="col-span-2 p-6">
                  <div className="mb-6">
                    <span className="inline-block px-3 text-sm font-semibold bg-blue-100 text-[#003D9B] rounded-md mb-2">
                      {localTask.task_id}
                    </span>

                    <input
                      defaultValue={localTask.title}
                      onBlur={(e) => handleUpdate("title", e.target.value)}
                      className="text-2xl font-bold border-b border-gray-200 pb-2 mb-4 w-full bg-transparent outline-none"
                    />
                  </div>

                  <textarea
                    defaultValue={localTask.description}
                    onBlur={(e) =>
                      handleUpdate("description", e.target.value || null)
                    }
                    className="text-gray-700 leading-relaxed w-full bg-transparent outline-none resize-none"
                  />
                </div>

                <div className="p-6 bg-[#F1F3FF] space-y-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">STATUS</p>

                    <div className="relative">
                      <span
                        onClick={() => setShowStatusDropdown((p) => !p)}
                        className={`block w-full px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${getStatusStyle(
                          localTask.status,
                        )}`}
                      >
                        {localTask.status}
                      </span>

                      {showStatusDropdown && (
                        <div className="absolute z-10 mt-1 bg-white shadow rounded w-full">
                          {statuses.map((s) => (
                            <div
                              key={s}
                              onClick={() => {
                                handleUpdate("status", s);
                                setShowStatusDropdown(false);
                              }}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-2">ASSIGNEE</p>

                    <div className="flex items-start gap-3 relative">
                      <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                        {getInitials(localTask.assignee?.name || "")}
                      </div>

                      <div>
                        <p
                          onClick={() => setShowAssigneeDropdown((p) => !p)}
                          className="font-medium text-sm cursor-pointer"
                        >
                          {localTask.assignee?.name || "Unassigned"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {localTask.assignee?.department || "No department"}
                        </p>

                        {showAssigneeDropdown && (
                          <div className="absolute z-10 mt-1 bg-white shadow rounded w-full">
                            <div
                              onClick={() => {
                                handleUpdate("assignee_id", null);
                                setLocalTask((p) => ({
                                  ...p,
                                  assignee: null,
                                }));
                                setShowAssigneeDropdown(false);
                              }}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                              Unassigned
                            </div>

                            {members.map((m) => (
                              <div
                                key={m.id}
                                onClick={() => {
                                  handleUpdate("assignee_id", m.id);
                                  setLocalTask((p) => ({
                                    ...p,
                                    assignee: m,
                                  }));
                                  setShowAssigneeDropdown(false);
                                }}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              >
                                {m.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-xs text-gray-400">DUE DATE</p>

                    <input
                      type="date"
                      defaultValue={
                        localTask.due_date
                          ? new Date(localTask.due_date)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleUpdate(
                          "due_date",
                          e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        )
                      }
                      className="text-sm bg-transparent outline-none"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-1">REPORTER</p>
                    <span>{localTask.created_by?.name || "-"}</span>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-xs text-gray-400">CREATED AT</p>
                    <span className="text-sm">
                      {formatDate(localTask.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4 md:hidden">
                <div className="grid grid-cols-2 gap-3">
                  <MobileCard label="ASSIGNEE">
                    {localTask.assignee?.name || "Unassigned"}
                  </MobileCard>

                  <MobileCard label="DUE DATE">
                    {formatDate(localTask.due_date)}
                  </MobileCard>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MobileCard label="CREATED BY">
                    {localTask.created_by?.name || "-"}
                  </MobileCard>

                  <MobileCard label="CREATED AT">
                    {formatDate(localTask.created_at)}
                  </MobileCard>
                </div>

                <MobileCard label="DESCRIPTION" full>
                  {localTask.description || "No description"}
                </MobileCard>
              </div>

              <div className="flex justify-center p-4 bg-[#F1F3FF]">
                <button
                  onClick={handleClose}
                  className="hidden md:block w-auto px-6 py-2 bg-[#D7E2FF] text-[#041B3C] rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MobileCard({ label, children, full }) {
  return (
    <div className={`bg-gray-50 rounded-xl p-3 ${full ? "col-span-2" : ""}`}>
      <p className="text-[10px] text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
}
