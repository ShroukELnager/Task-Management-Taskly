"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "../services/auth.service";


export default function ResetPassword() {
  const router = useRouter();

  const { register, watch, handleSubmit } = useForm();

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";

  const [accessToken, setAccessToken] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));

    const token = params.get("access_token");
    const type = params.get("type");

    if (type === "recovery" && token) {
      setAccessToken(token);
    } else {
      setErrorMsg("Invalid or expired reset link.");
    }
  }, []);

  const hasLength = password.length >= 8 && password.length <= 64;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  const isValidPassword =
    hasLength && hasLower && hasUpper && hasDigit && hasSpecial;
  const mutation = useMutation({
    mutationFn: resetPassword,

    onSuccess: () => {
      setSuccessMsg(
        "Your password has been updated successfully. You can now log in"
      );

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    },

    onError: (err) => {
      setErrorMsg(err.message || "Something went wrong");
    },
  });

  const onSubmit = () => {
    if (!isValidPassword) {
      setErrorMsg("Password does not meet requirements");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setErrorMsg("");

    mutation.mutate({
      password,
      accessToken,
    });
  };

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {errorMsg || "Invalid or expired reset link."}
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9FF] min-h-screen px-4">
      <div className="flex items-center gap-2 p-4">
        <Image src="/images/logo.svg" width={20} height={20} alt="logo" />
        <h1 className="font-bold text-xl">TASKLY</h1>
      </div>

      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5"
        >
          <div className="space-y-2">
            <h1 className="text-xl font-bold">Create a new password</h1>
            <p className="text-sm text-gray-400">
              Create a new, strong password to secure your workstation access.
            </p>
          </div>

          <input
            type="password"
            placeholder="Enter new password"
            className="w-full h-12 px-4 rounded-lg bg-[#EEF2FF]"
            {...register("password", { required: true })}
          />

          <input
            type="password"
            placeholder="Confirm password"
            className="w-full h-12 px-4 rounded-lg bg-[#EEF2FF]"
            {...register("confirmPassword", { required: true })}
          />

          {/* requirements */}
          <div className="bg-[#EEF2FF] p-4 rounded-lg text-sm space-y-2">
            <p className="text-xs text-gray-400">SECURITY REQUIREMENTS</p>

            <p className={hasLength ? "text-green-600" : "text-gray-400"}>
              8-64 characters
            </p>
            <p className={hasUpper ? "text-green-600" : "text-gray-400"}>
              Uppercase letter
            </p>
            <p className={hasLower ? "text-green-600" : "text-gray-400"}>
              Lowercase letter
            </p>
            <p className={hasDigit ? "text-green-600" : "text-gray-400"}>
              One digit
            </p>
            <p className={hasSpecial ? "text-green-600" : "text-gray-400"}>
              Special character
            </p>
          </div>

          {/* errors */}
          {errorMsg && (
            <p className="text-red-500 text-sm">{errorMsg}</p>
          )}

          {/* success */}
          {successMsg && (
            <p className="text-green-600 text-sm">{successMsg}</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-12 bg-[#014DC0] text-white rounded-lg"
          >
            {mutation.isPending ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
