import { format } from "date-fns";
import ProjectsSelect from "../ProjectsSelect/ProjectsSelect";
import StatusSelect from "../StatusSelect/StatusSelect";
import { DatePicker } from "../datePicker/datePicker";

export default function StatsFilters({ setFilters }) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-[#F1F3FF] p-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex w-full flex-col items-center gap-3 lg:hidden">
        <div className="flex w-full justify-center">
          <div className="w-[50%]">
            <ProjectsSelect
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, project: val }))
              }
            />
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-2">
          <div className="flex-1">
            <DatePicker
              onChange={(range) => {
                setFilters((prev) => ({
                  ...prev,
                  from: range.from
                    ? format(new Date(range.from), "yyyy-MM-dd")
                    : null,
                  to: range.to
                    ? format(new Date(range.to), "yyyy-MM-dd")
                    : null,
                }));
              }}
            />
          </div>

          <div className="flex-1">
            <StatusSelect
              onChange={(val) =>
                setFilters((prev) => ({ ...prev, status: val }))
              }
            />
          </div>
        </div>
      </div>

      <div className="hidden w-full flex-wrap items-start justify-between gap-4 lg:flex">
        <DatePicker
          onChange={(range) => {
            setFilters((prev) => ({
              ...prev,
              from: range.from
                ? format(new Date(range.from), "yyyy-MM-dd")
                : null,
              to: range.to ? format(new Date(range.to), "yyyy-MM-dd") : null,
            }));
          }}
        />

        <div className="flex flex-wrap items-center justify-end gap-3">
          <ProjectsSelect
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, project: val }))
            }
          />

          <StatusSelect
            onChange={(val) => setFilters((prev) => ({ ...prev, status: val }))}
          />
        </div>
      </div>
    </div>
  );
}
