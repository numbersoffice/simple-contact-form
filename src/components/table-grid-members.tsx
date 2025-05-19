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
import { ReactNode } from 'react'
import GridRowActionsInvite from './grid-row-actions-invite'
import { Badge } from './ui/badge'
import GridRowActionsMember from './grid-row-actions-member'

export type Form = {
  id: string
  email: string
  role: string
  status: 'Pending' | 'Verified'
  self: boolean
}

interface DataTableProps<TData extends { id: string; status: 'Pending' | 'Verified' }, _TValue> {
  data: TData[]
  teamId: string
  userRole: string
}

export default function TableGridMembers<
  TData extends { id: string; self: boolean; status: 'Pending' | 'Verified' },
  TValue,
>({ data, teamId, userRole }: DataTableProps<TData, TValue>) {
  // Create columns
  const columns: ColumnDef<TData>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row, cell }) => {
        return (
          <div className="flex gap-2">
            {cell.renderValue() as ReactNode}{' '}
            {row.original.self && <Badge variant="outline">You</Badge>}
          </div>
        )
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ cell }) => {
        return (
          <Badge
            className={cell.getValue() === 'Owner' ? 'bg-blue-500' : 'bg-gray-200 text-gray-600'}
          >
            {cell.getValue() as ReactNode}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return row.original.self || userRole !== 'Owner' ? null : row.original.status ===
          'Pending' ? (
          <GridRowActionsInvite teamId={teamId} docId={row.original.id} />
        ) : (
          <GridRowActionsMember teamId={teamId} memberId={row.original.id} />
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

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
                className="hover:bg-white"
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.id === 'actions' ? 'px-0' : 'b-blue-400'}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
