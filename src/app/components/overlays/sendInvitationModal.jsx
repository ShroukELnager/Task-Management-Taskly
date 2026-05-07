"use client";

import { sendInvitation } from "@/app/services/invitation.service";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";

export default function SendInvitationModal({ open, onClose }) {
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { projectId } = useParams();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: sendInvitation,

    onSuccess: () => {
      setMessage("Invitation sent successfully");
      setErrorMsg("");
      reset();
    },

    onError: (err) => {
      setErrorMsg(err.message || "Something went wrong");
      setMessage("");
    },
  });
  const onSubmit = (data) => {
    mutation.mutate({
      email: data.p_email,
      projectId,
    });
  };

  if (!open) return null;
  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-[500px] rounded-xl shadow-lg p-6 relative">

        <button
          onClick={onClose}
          className="absolute top-3 right-3"
        >
          <Image src="/images/close.png" alt="close" width={16} height={16} />
        </button>

        <div className="w-12 h-12 bg-[#EEF2FF] rounded-lg flex items-center justify-center mb-4">
          <Image src="/images/invite.png" alt="invite" width={24} height={24} />
        </div>

        <h1 className="font-bold text-xl text-[#0F172A]">
          Invite Team Member
        </h1>

        <p className="text-gray-500 text-sm mt-2 mb-6">
          Send an invitation to join the Architectural Studio workspace.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

          <label className="text-xs font-semibold text-gray-500">
            EMAIL ADDRESS
          </label>

          <div className="relative">
            <input
              type="email"
              placeholder="Enter email address"
              {...register("p_email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email",
                },
              })}
              className="w-full h-11 bg-[#F1F3FF] rounded-md px-3 pr-10 text-sm outline-none"
            />

            <Image
              src="/images/email.png"
              alt="mail"
              width={16}
              height={16}
              className="absolute right-3 top-3.5 opacity-60"
            />
          </div>

          {errors.p_email && (
            <p className="text-red-500 text-xs">
              {errors.p_email.message}
            </p>
          )}

          {message && (
            <p className="text-green-600 text-sm">{message}</p>
          )}

          {errorMsg && (
            <p className="text-red-500 text-sm">{errorMsg}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/2 h-11 bg-gray-100 text-gray-600 rounded-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full sm:w-1/2 h-11 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? "Sending..." : "Send Invitation"}
            </button>

          </div>
        </form>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
