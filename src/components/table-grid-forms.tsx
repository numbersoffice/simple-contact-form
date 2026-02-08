'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

export type Form = {
  id: string
  name: string
  formId: string
  status: 'active' | 'pending'
  spamFilterEnabled: boolean
  recipientCount: number
}

const columns: ColumnDef<Form>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'recipientCount',
    header: 'Recipients',
    cell: ({ row }) => {
      const count = row.original.recipientCount
      return <span className="text-muted-foreground">{count}</span>
    },
  },
  {
    accessorKey: 'spamFilterEnabled',
    header: 'Spam Filter',
    cell: ({ row }) => {
      const enabled = row.original.spamFilterEnabled
      return (
        <Badge variant={enabled ? 'default' : 'secondary'} className={enabled ? 'bg-blue-500' : ''}>
          {enabled ? 'On' : 'Off'}
        </Badge>
      )
    },
  },
]

interface DataTableProps {
  data: Form[]
}

export default function TableGridForms({ data }: DataTableProps) {
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
                onClick={() => handleRowClick(row.original.id)}
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
                      flexRender(cell.column.columnDef.cell, cell.getContext())
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
