'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Team } from '@/payload-types'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Badge } from './ui/badge'
import GridRowActionsRecipientInvite from './grid-row-actions-recipient'
import { useAppData } from '@/context/app-data'

export type Form = {
  id: string
  email: string
  team: Team
  status: boolean
}

interface DataTableProps<TData, _TValue> {
  data: TData[]
}

export default function TableGridRecipients<TData extends { status: boolean; id: string }, TValue>({
  data,
}: DataTableProps<TData, TValue>) {
  const { activeTeam } = useAppData()

  const columns: ColumnDef<TData>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ cell }) => (
        <Badge className={cell.getValue() ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}>
          {cell.getValue() ? 'Verified' : 'Pending'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <GridRowActionsRecipientInvite
            pending={!row.original.status}
            teamId={activeTeam.id}
            recipientId={row.original.id}
          />
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
                    className={cell.column.columnDef.id === 'actions' ? 'px-0' : ''}
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
