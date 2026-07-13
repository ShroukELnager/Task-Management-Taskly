"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

import { SignupSchema } from "../components/schema/signupSchema";
import { setAccessToken, setUser } from "../features/users/userSlice";
import { signup } from "../services/auth.service";
import { getValidAccessToken } from "../lib/auth/auth";

export default function Signup() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(SignupSchema),
  });

  const password = watch("password") || "";

  const hasLength = password.length >= 8;
  const hasUpperLowerDigit = /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  const mutation = useMutation({
    mutationFn: signup,

    onSuccess: async (result) => {
      if (!result?.user) {
        setApiError("Signup failed. Please try again.");
        return;
      }

      const { user, access_token, refresh_token, expires_at } = result;

      if (access_token && refresh_token && expires_at) {
        const expiresDate = new Date(expires_at * 1000);

        const cookieOptions = {
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: expiresDate,
        };

        Cookies.set("access_token", access_token, cookieOptions);
        Cookies.set("refresh_token", refresh_token, cookieOptions);
        Cookies.set("access_token_expiry", expires_at, cookieOptions);

        const validToken = await getValidAccessToken();
        dispatch(setAccessToken(validToken || access_token));
      }

      dispatch(setUser(user));
      router.push("/projects");
    },

    onError: (err) => {
      setApiError(err.message || "Something went wrong");
    },
  });

  const onSubmit = (data) => {
    setApiError("");
    mutation.mutate(data);
  };

  return (
    <div className="bg-[#F9F9FF] min-h-screen overflow-x-hidden">
      <div className="flex items-center gap-2 p-4">
        <Image src="/images/logo.svg" width={20} height={20} alt="logo" />
        <h1 className="font-bold text-xl">TASKLY</h1>
      </div>

      <div className="flex justify-center items-center min-h-screen px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5"
        >
          <h1 className="text-2xl font-bold text-center">
            Create Your Workspace
          </h1>

          <p className="text-gray-400 text-sm text-center">
            Join the editorial approach to task management
          </p>

          {apiError && (
            <p className="text-red-500 text-sm text-center">{apiError}</p>
          )}

          <div className="space-y-1">
            <label className="text-sm text-[#8691A4] font-medium">Name</label>
            <input
              placeholder="Name"
              className="w-full h-12 px-3 rounded-md bg-[#D7E2FF] outline-none"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[#8691A4] font-medium">Email</label>
            <input
              placeholder="Email"
              className="w-full h-12 px-3 rounded-md bg-[#D7E2FF] outline-none"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[#8691A4] font-medium">
              Job Title
            </label>
            <input
              placeholder="e.g. task manager"
              className="w-full h-12 px-3 rounded-md bg-[#D7E2FF] outline-none"
              {...register("jobTitle")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm text-[#8691A4] font-medium">
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                className="w-full h-12 px-3 rounded-md bg-[#D7E2FF] outline-none"
                {...register("password")}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-[#8691A4] font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full h-12 px-3 rounded-md bg-[#D7E2FF] outline-none"
                {...register("confirmedPassword")}
              />
            </div>

            <div className="bg-[#D7E2FF] p-4 rounded-lg space-y-3 text-sm col-span-2">
              <div className="flex items-center gap-2">
                <Image
                  src={
                    hasLength ? "/images/radiocheck.svg" : "/images/Icon.svg"
                  }
                  width={14}
                  height={14}
                  alt="status"
                />
                <span className={hasLength ? "text-green-600" : "text-gray-500"}>
                  At least 8 characters
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Image
                  src={
                    hasUpperLowerDigit
                      ? "/images/radiocheck.svg"
                      : "/images/Icon.svg"
                  }
                  width={14}
                  height={14}
                  alt="status"
                />
                <span
                  className={
                    hasUpperLowerDigit ? "text-green-600" : "text-gray-500"
                  }
                >
                  One uppercase, lowercase & digit
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Image
                  src={
                    hasSpecial ? "/images/radiocheck.svg" : "/images/Icon.svg"
                  }
                  width={14}
                  height={14}
                  alt="status"
                />
                <span className={hasSpecial ? "text-green-600" : "text-gray-500"}>
                  One special character
                </span>
              </div>
            </div>
          </div>

          <button
            disabled={mutation.isPending}
            className="w-full bg-[#014DC0] text-white h-12 rounded-md hover:opacity-90 transition"
          >
            {mutation.isPending ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center text-sm pt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
