"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { useMutation } from "@tanstack/react-query";

import { loginSchema } from "../components/schema/loginschema";

import { getValidAccessToken } from "../lib/auth/auth";
import { login } from "../services/auth.service";
import { setAccessToken, setUser } from "../features/users/userSlice";

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [apiError, setApiError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: login,

    onSuccess: async (result) => {
      const { access_token, refresh_token, user, expires_at } = result;

      if (!access_token || !refresh_token || !expires_at) {
        setApiError("Login response is missing required auth tokens.");
        return;
      }

      const expiresDate = new Date(expires_at * 1000);

      const cookieOptions = {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        ...(rememberMe && { expires: expiresDate }),
      };

      Cookies.set("access_token", access_token, cookieOptions);
      Cookies.set("refresh_token", refresh_token, cookieOptions);
      Cookies.set("access_token_expiry", expires_at, cookieOptions);

      const validToken = await getValidAccessToken();

      dispatch(setAccessToken(validToken || access_token));
      dispatch(setUser(user));
      console.log(user);

      router.push(redirect || "/projects");
    },

    onError: (err) => {
      setApiError(err.message || "Something went wrong");
    },
  });

  useEffect(() => {
    const checkToken = async () => {
      const token = await getValidAccessToken();

      if (token) {
        dispatch(setAccessToken(token));
        router.push(redirect || "/projects");
      }
    };

    checkToken();
  }, [dispatch, redirect, router]);

  const onSubmit = (data) => {
    setApiError("");
    mutation.mutate(data);
  };

  return (
    <div className="bg-[#F9F9FF] h-screen w-screen overflow-x-hidden">
      <div className="flex items-center gap-2 p-4">
        <Image src="/images/logo.svg" width={20} height={20} alt="logo" />
        <h1 className="font-bold text-xl">TASKLY</h1>
      </div>

      <div className="flex justify-center items-center min-h-screen px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6"
        >
          <div className="text-center space-y-1">
            <h1 className="font-bold text-2xl">Welcome Back</h1>
            <p className="text-gray-400 text-sm">
              Please enter your details to access your workspace
            </p>
          </div>

          {apiError && (
            <p className="text-red-500 text-sm text-center">{apiError}</p>
          )}

          <div className="space-y-1">
            <label className="text-sm text-[#8691A4] font-medium">EMAIL</label>
            <input
              type="email"
              {...register("email")}
              className="w-full h-12 px-3 rounded-md border bg-[#D7E2FF]"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[#8691A4] font-medium">
              PASSWORD
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full h-12 px-3 rounded-md border bg-[#D7E2FF]"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-[#8691A4]">Remember me</span>
            </label>

            <Link href="/forgot-password" className="text-[#014DC0]">
              Forgot password?
            </Link>
          </div>

          <button
            disabled={mutation.isPending}
            className="w-full bg-[#014DC0] text-white h-12 rounded-md"
          >
            {mutation.isPending ? "Logging in..." : "Log In"}
          </button>

          <p className="text-sm text-center">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-[#014DC0] font-semibold">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
