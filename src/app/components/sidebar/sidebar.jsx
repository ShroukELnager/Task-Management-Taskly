"use client";

import Image from "next/image";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { useRouter, useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/app/services/auth.service";

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { projectId } = useParams();
  const pathname = usePathname();

  const isProjectSelected = !!projectId;
  const showLabels = open || mobileOpen;

  const projectLinks = [
    
    {
      name: "Project Epics",
      icon: "/images/epics.svg",
      href: `/projects/${projectId}/epics`,
    },
    {
      name: "Project Tasks",
      icon: "/images/tasks.svg",
      href: `/projects/${projectId}/tasks`,
    },
    {
      name: "Project Member",
      icon: "/images/member.svg",
      href: `/projects/${projectId}/members`,
    },
    {
      name: "Project Details",
      icon: "/images/details.svg",
      href: `/projects/${projectId}/edit`,
    },
  ];


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
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200/70 bg-[#F1F3FF] px-4 md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/70"
            aria-label="Open menu"
          >
            <Image
              src="/images/humberger.png"
              width={20}
              height={18}
              alt="menu"
            />
          </button>
          <span className="truncate font-bold">TASKLY</span>
        </div>
      </div>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <div
        className={`
          fixed left-0 top-0 z-50
          flex h-dvh flex-col border-r border-gray-200/60 bg-[#F1F3FF]
          transition-all duration-300
          w-72 md:sticky md:z-30 ${open ? "md:w-64" : "md:w-20"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex h-16 items-center gap-2 px-5">
          <Image src="/images/logo.svg" width={28} height={28} alt="logo" />

          {showLabels && (
            <h1 className="truncate text-xl font-bold whitespace-nowrap">TASKLY</h1>
          )}
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                href="/my-statistics"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center rounded-md py-3 hover:bg-gray-100 transition ${
                  showLabels ? "gap-3 px-4" : "justify-center px-0"
                }`}
              >
                <Image
                  src="/images/statistics.png"
                  width={20}
                  height={18}
                  alt="Statistics"
                  className="h-5 w-5 shrink-0"
                />

                {showLabels && (
                  <span className="truncate text-sm font-medium">
                    My Statistics
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/projects"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center rounded-md py-3 hover:bg-gray-100 transition ${
                  showLabels ? "gap-3 px-4" : "justify-center px-0"
                }`}
              >
                <Image
                  src="/images/proj.png"
                  width={20}
                  height={18}
                  alt="Projects"
                  className="h-5 w-5 shrink-0"
                />

                {showLabels && (
                  <span className="truncate text-sm font-medium">Projects</span>
                )}
              </Link>
            </li>

            {isProjectSelected && showLabels && (
              <li className="px-4 pt-4 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Project
              </li>
            )}

            {isProjectSelected &&
              projectLinks.map((link) => {
                const active = pathname === link.href;

                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center rounded-md py-3 transition ${
                        showLabels ? "gap-3 px-4" : "justify-center px-0"
                      } ${active ? "bg-white text-blue-700 shadow-sm" : "hover:bg-gray-100"}`}
                    >
                      <Image
                        src={link.icon}
                        width={20}
                        height={18}
                        alt={link.name}
                        className="h-5 w-5 shrink-0"
                      />

                      {showLabels && (
                        <span className="truncate text-sm">{link.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-gray-200/60 px-2 py-4">
          <button
            onClick={() => setOpen(!open)}
            className={`hidden items-center rounded-md py-3 hover:bg-gray-100 transition md:flex ${
              open ? "gap-3 px-4" : "justify-center px-0"
            }`}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Image
              src={open ? "/images/arrowleft.svg" : "/images/arrowright.svg"}
              width={10}
              height={10}
              alt=""
              className="shrink-0"
            />
            {open && <span className="text-sm cursor-pointer">Collapse</span>}
          </button>

          <button
            onClick={() => handleLogout()}
            disabled={isPending}
            className={`flex items-center cursor-pointer rounded-md py-3 hover:bg-gray-100 transition ${
              showLabels ? "gap-3 px-4" : "justify-center px-0"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <Image
              src="/images/logout.svg"
              width={20}
              height={18}
              alt=""
              className="h-5 w-5 shrink-0"
            />
            {showLabels && (
              <span className="text-sm">
                {isPending ? "Logging out..." : "Logout"}
              </span>
            )}
          </button>

          {error && showLabels && (
            <p className="px-4 text-xs text-red-500">{error}</p>
          )}
        </div>
      </div>
    </>
  );
}
