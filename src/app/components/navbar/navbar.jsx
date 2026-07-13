"use client";

import { useSelector, useDispatch } from "react-redux";
import { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { getValidAccessToken } from "@/app/lib/auth/auth";
import { fetchUsers } from "@/app/features/users/usersThunk";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/app/services/auth.service";

export default function Navbar() {
  const user = useSelector((state) => state.users.user);
  console.log("user",user)
  const dispatch = useDispatch();

  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef();
  const router = useRouter();

  const name = user?.name || "No name provided";

  const jobTitle = user?.jobTitle || "No job title provided";

  const email = user?.email || "No email";

  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const syncAuth = async () => {
      const token = await getValidAccessToken(dispatch);

      if (token) {
        dispatch(fetchUsers());
      }
    };

    syncAuth();
  }, [dispatch]);


const { mutate: handleLogout, isPending } = useMutation({
  mutationFn: logout,

  onSuccess: () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("expires_at");
    Cookies.remove("access_token_expiry");

    router.replace("/login");
  },

  onError: () => {
    setError("Logout failed, please try again.");
  },
});

  return (
    <div className="sticky top-14 z-30 flex h-16 w-full items-center border-b border-gray-300/60 bg-[#F9F9FF]/95 px-4 backdrop-blur md:top-0 sm:px-6 lg:px-8">
      <div
        className="relative ml-auto flex min-w-0 items-center gap-3"
        ref={dropdownRef}
      >
        <div className="hidden max-w-[220px] text-right sm:block lg:max-w-[320px]">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-gray-500">{jobTitle}</p>
        </div>

        <div
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border bg-blue-600 text-sm font-semibold text-white"
        >
          {initials}
        </div>

        {open && (
          <div className="animate-fadeIn absolute right-0 top-14 z-50 w-[min(calc(100vw-2rem),18rem)] rounded-xl bg-white p-4 shadow-xl">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">{name}</p>
                <p className="truncate text-xs text-gray-500">{email}</p>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <button
              onClick={() => handleLogout()}
              disabled={isPending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-red-50 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
