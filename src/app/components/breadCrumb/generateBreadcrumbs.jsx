export function generateBreadcrumbs(
  pathname,
  projectsMap = {},
  projectId
) {
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = [];
  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;

    const segment = segments[i];

    const isProjectSegment =
      Boolean(projectId) &&
      segment === projectId &&
      segments[i - 1] === "projects";

    const label =
      segment === projectId
        ? formatProjectName(projectsMap[segment])
        : projectsMap[segment] || formatSegmentLabel(segment);

    breadcrumbs.push({
      label: String(label),
      href: currentPath,
      isProject: isProjectSegment,
    });
  }

  return breadcrumbs;
}


function formatProjectName(name) {
  if (!name) return "Project";

  return name
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}


function formatSegmentLabel(segment) {
  const staticRouteLabels = {
    projects: "Projects",
    project: "Project",
    epics: "Epics",
    tasks: "Tasks",
    members: "Members",
    create: "Create",
    edit: "Edit",
  };

  if (staticRouteLabels[segment]) {
    return staticRouteLabels[segment];
  }

  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}