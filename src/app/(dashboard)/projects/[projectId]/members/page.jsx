"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import MembersSkeleton from "@/app/components/skeleton/member";
import EpicsError from "@/app/components/errorsPages/epics";
import Image from "next/image";

import { getProjectMembers } from "@/app/services/members.service";
import SendInvitationModal from "@/app/components/overlays/sendInvitationModal";

export default function MembersPage() {
  const { projectId } = useParams();
const [open, setOpen] = useState(false);

const {
  data: members = [],
  isLoading,
  isError,
  refetch,
} = useQuery({
  queryKey: ["project-members", projectId],
  queryFn: () => getProjectMembers(projectId),
  enabled: !!projectId,
  select: (res) => res?.data ?? [],
});

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (isLoading) return <MembersSkeleton />;

  if (isError)
    return <EpicsError fetchEpics={refetch} />;

  if (members.length === 0)
    return (
      <div className="p-6 text-center text-gray-500">
        No members found in this project.
      </div>
    );

  return (<>
   <SendInvitationModal open={open} onClose={() => setOpen(false)} />

    <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-x-hidden">

      <h1 className="text-2xl font-semibold text-center lg:text-left mb-6">
        Project Members
      </h1>

      <div className="hidden sm:flex justify-end mb-6">
        <button
        onClick={()=>{setOpen(true)}}
         className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition flex items-center gap-2">
          <Image
            src="/images/invite.svg"
            alt="Invite"
            width={16}
            height={16}
          />
          Invite Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="hidden sm:grid grid-cols-3 p-4 text-xs text-gray-500 font-medium border-b">
          <p>MEMBER</p>
          <p>ROLE</p>
          <p>ACTIONS</p>
        </div>

        {members.map((member, index) => {
          const name = member.metadata?.name || "Unknown";
          const email = member.metadata?.email || "-";

          return (
            <div
              key={index}
              className="
                flex flex-col sm:grid sm:grid-cols-3
                gap-3 sm:gap-0
                p-4 border-b border-blue-100
                hover:bg-blue-50 transition
              "
            >
              <div className="flex items-center justify-between gap-3 min-w-0">

                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-lg font-semibold shrink-0">
                    {getInitials(name)}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <p className="text-xs text-gray-500 truncate">{email}</p>
                  </div>
                </div>

                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full sm:hidden">
                  {member.role}
                </span>
              </div>

              <div className="hidden sm:block">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                  {member.role}
                </span>
              </div>

              <div className="flex justify-end sm:block cursor-pointer text-lg text-gray-500 ml-6">
                ⋮
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setOpen(true)}
        className="
          sm:hidden
          fixed bottom-6 right-6
          w-12 h-12
          flex items-center justify-center
          rounded-full
          bg-blue-600 text-white shadow-lg
          hover:bg-blue-700 transition
        "
      >
        <Image
          src="/images/invite.svg"
          alt="Invite"
          width={20}
          height={20}
        />
      </button>
    </div></>
   
  );
}
