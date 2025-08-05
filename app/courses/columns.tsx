"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

const exampleStudent = {
  school: "seds",
  major: "comsci",
  year: 2,
  level: "ug",
};

export type Course = {
  abbr: string;
  title: string;
  cr_ects: string;
  prioritiies: {
    group: {
      year: number | null;
      level: string | null;
      school: string | null;
      major: string | null;
      notes: string | null;
    };
    priority: number;
  }[];
  schedules: {
    section: string;
    days: string[];
    course_cap: string;
    faculty: string;
    room: string;
    room_cap: string;
    distant: boolean;
    start_time_info: number[]; // [hour, minute]
    end_time_info: number[]; // [hour, minute]
  }[];
};

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "abbr",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Course code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const abbr = row.original.abbr;
      return <span className="uppercase font-semibold">{abbr}</span>;
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "cr_ects",
    header: "ECTS",
  },
  {
    accessorKey: "prioritiies",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    // Custom sorting function for priorities
    sortingFn: (rowA, rowB, columnId) => {
      const prioritiesA = rowA.original.prioritiies;
      const prioritiesB = rowB.original.prioritiies;

      // Get the highest priority (lowest number) for each course
      const getHighestPriority = (priorities: Course["prioritiies"]) => {
        if (priorities.length === 0) return Infinity; // No priority = lowest ranking
        return Math.min(...priorities.map((p) => p.priority));
      };

      const priorityA = getHighestPriority(prioritiesA);
      const priorityB = getHighestPriority(prioritiesB);

      // Lower priority number = higher ranking (1st > 2nd > 3rd, etc.)
      return priorityA - priorityB;
    },
    cell: ({ row }) => {
      const priorities = row.original.prioritiies;
      return (
        <div className="flex flex-wrap gap-1">
          {priorities.map((priority, index) => {
            const { group, priority: prio } = priority;
            const prio_str =
              prio === 1
                ? "1st"
                : prio === 2
                ? "2nd"
                : prio === 3
                ? "3rd"
                : `${prio}th`;
            const prio_color =
              prio === 1
                ? "bg-green-600"
                : prio === 2
                ? "bg-blue-600"
                : prio === 3
                ? "bg-amber-600"
                : "bg-gray-600"; // Fixed: was `${prio}th` which is invalid CSS

            let group_str = "";
            if (group.school) {
              group_str += `${group.school}/`;
            }
            if (group.major) {
              group_str += `${group.major}/`;
            }
            if (group.year) {
              group_str += `${group.level}${group.year}/`;
            } else {
              group_str += `ALL/`;
            }
            if (group.notes) {
              group_str += `${group.notes.replace(
                "pending graduation",
                "pending"
              )}`;
            }
            group_str = group_str.replace(/\/+$/, ""); // Remove trailing slash
            group_str = group_str.toUpperCase();

            return (
              <Badge
                variant={"outline"}
                key={index}
                className="mb-1 rounded-full text-xs pl-0.5 pr-2 border-muted-foreground text-muted-foreground hover:pointer-none select-none hover:text-foreground"
              >
                <span
                  className={cn(
                    "rounded-full px-2 py-px text-white",
                    prio_color
                  )}
                >
                  {prio_str}
                </span>
                {group_str}
              </Badge>
            );
          })}
        </div>
      );
    },
  },
];
