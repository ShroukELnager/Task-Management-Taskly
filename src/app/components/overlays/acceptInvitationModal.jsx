"use client";

import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { acceptInvitation } from "@/app/services/invitation.service";

export default function AcceptInviteModal({ open, onClose }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const mutation = useMutation({
    mutationFn: () => acceptInvitation(token),

    onSuccess: (result) => {
      setSuccessMsg("Invitation accepted successfully ");
      setErrorMsg("");

      setTimeout(() => {
        const projectId =
          result?.data?.project_id ||
          result?.data?.p_project_id ||
          result?.data?.[0]?.project_id;

        router.push(projectId ? `/projects` : "/projects");
      }, 1500);
    },

    onError: (err) => {
      setErrorMsg(err.message || "Something went wrong");
      setSuccessMsg("");
    },
  });

  const handleAccept = () => {
    if (!token) {
      setErrorMsg("Invalid invitation link");
      return;
    }

    mutation.mutate();
  };

  if (!open) return null;
  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[520px] rounded-xl shadow-xl p-8 text-center relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3"
        >
          <Image src="/images/close.png" alt="close" width={16} height={16} />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#3B82F6] text-xs font-medium px-3 py-1 rounded-full mb-6">
          <Image src="/images/new.png" width={16} height={16} alt="" />
          NEW PROJECT INVITATION
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] mb-6">
          You’ve been invited to join <br />
          <span className="font-bold">a new project</span>
        </h2>

        {/* Messages */}
        {successMsg && (
          <p className="text-green-600 text-sm mb-4">{successMsg}</p>
        )}

        {errorMsg && (
          <p className="text-red-500 text-sm mb-4">{errorMsg}</p>
        )}

        {/* Button */}
        <button
          onClick={handleAccept}
          disabled={mutation.isPending}
          className="w-full h-12 bg-blue-700 text-white rounded-md shadow-md hover:bg-blue-800 transition disabled:opacity-50"
        >
          {mutation.isPending ? "Accepting..." : "Accept Invitation"}
        </button>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
