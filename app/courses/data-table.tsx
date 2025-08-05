"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const router = useRouter();

  // Add selection column to the beginning of columns
  const columnsWithSelection: ColumnDef<TData, TValue>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...columns,
  ];

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCourses = selectedRows.map((row) => row.original);

  const handleCreateSchedule = () => {
    // Convert selected courses to URL search params
    const courseIds = selectedCourses.map((course: any) => course._id);
    const searchParams = new URLSearchParams({
      courses: courseIds.join(","),
    });

    // Navigate to schedule page with selected courses
    router.push(`/schedule?${searchParams.toString()}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-4 w-full">
          <Input
            placeholder="Filter courses..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event: any) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          {selectedRows.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedRows.length} of {table.getFilteredRowModel().rows.length}{" "}
              course(s) selected
            </div>
          )}
        </div>
        <Button
          onClick={handleCreateSchedule}
          disabled={true}
          className="flex items-center gap-2"
        >
          Create Schedule
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={row.getIsSelected() ? "bg-muted/50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnsWithSelection.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Optional: Show selected courses summary */}
      {selectedRows.length > 0 && (
        <div className="mt-4 p-4 bg-muted/30 rounded-md">
          <h4 className="font-semibold mb-2">
            Selected Courses ({selectedRows.length}):
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedCourses.map((course: any, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium"
              >
                {course.abbr}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
