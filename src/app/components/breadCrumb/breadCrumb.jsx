"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useMemo } from "react";
import { generateBreadcrumbs } from "./generateBreadcrumbs";
import { useProjectById } from "@/app/hooks/useProjectById";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const { projectId } = useParams();

  const { data: project } = useProjectById(projectId);

  const projectsMap = useMemo(() => {
    if (!project) return {};
    const projectName = project.name || project.title || project.project_name;

    return {
      [project.id || projectId]: projectName || "Project",
    };
  }, [project, projectId]);

  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbs(pathname, projectsMap, projectId);
  }, [pathname, projectsMap, projectId]);

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-3 h-3 mx-1 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                />
              </svg>
            )}

            {breadcrumb.isProject ? (
              <Link
                href={`/projects/${projectId}/edit`}
                className="text-sm font-medium text-gray-400 hover:text-blue-600"
              >
                {breadcrumb.label}
              </Link>
            ) : index === breadcrumbs.length - 1 ? (
              <span className="text-sm font-medium text-blue-600">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="text-sm font-medium text-gray-400 hover:text-blue-600"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
