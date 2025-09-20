'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { ChevronRight, ClipboardCopy } from 'lucide-react'
import { toast } from 'sonner'

export type Form = {
  id: string
  name: string
  status: 'active' | 'pending'
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export default function TableGridForms<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const router = useRouter()
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  function handleRowClick(formId: string) {
    router.push(`./forms/${formId}`)
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                data-id={row.id}
                className="cursor-pointer group"
                onClick={() => handleRowClick(row.getValue('id'))}
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {cell.column.id === 'name' ? (
                      <div className="flex items-center gap-1">
                        {cell.getValue() as ReactNode}{' '}
                        <ChevronRight
                          width={16}
                          className="duration-200 group-hover:translate-x-[2px] translate-z-0"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-2 w-fit"
                        onClick={(e) => {
                          e.stopPropagation()

                          // Copy to clipboard
                          navigator.clipboard.writeText(cell.getValue() as string)
                          toast.success('Copied to clipboard')
                        }}
                      >
                        {cell.getValue() as ReactNode}{' '}
                        <ClipboardCopy
                          size={23}
                          className="duration-150 p-1 rounded-sm hover:bg-gray-200"
                        />
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-gray-400 text-center">
                There are no forms, yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
