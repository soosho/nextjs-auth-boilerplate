"use client"

import * as React from "react"
import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatAmount } from "@/lib/utils/format"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"

// Type definitions
export type Deposit = {
  id: number
  txid: string
  amount: number
  status: string
  confirmations: number
  credited: boolean
  created_at: string
  wallet: {
    currency: {
      name: string
      symbol: string
      blockchain: {
        explorer_transaction: string | null
        min_confirmations: number
      }
    }
  }
}

// Column definitions
export const columns: ColumnDef<Deposit>[] = [
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => formatDate(new Date(row.original.created_at))
  },
  {
    accessorKey: "wallet.currency.symbol",
    header: "Currency",
    cell: ({ row }) => {
      const { symbol, name } = row.original.wallet.currency
      return (
        <div className="flex items-center gap-2">
          <Image
            src={`/icons/coins/${symbol.toLowerCase()}.webp`}
            alt={symbol}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span>{name} ({symbol})</span>
        </div>
      )
    }
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-mono whitespace-nowrap">
        {formatAmount(row.original.amount)} {row.original.wallet.currency.symbol}
      </div>
    )
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { confirmations } = row.original
      const minConfirmations = row.original.wallet.currency.blockchain.min_confirmations

      if (confirmations === 0) {
        return <Badge variant="outline">Initiated</Badge>
      }

      if (confirmations < minConfirmations) {
        return (
          <Badge variant="warning">
            Confirming ({confirmations}/{minConfirmations})
          </Badge>
        )
      }

      return <Badge variant="success">Confirmed</Badge>
    }
  },
  {
    accessorKey: "confirmations",
    header: "Confirmations",
    cell: ({ row }) => row.original.confirmations
  },
  {
    accessorKey: "txid",
    header: "TxID",
    cell: ({ row }) => {
      const { explorer_transaction } = row.original.wallet.currency.blockchain
      const txid = row.original.txid
      const url = `${explorer_transaction}${txid}`

      return (
        <a 
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-blue-500 hover:text-blue-600 truncate max-w-[200px]"
        >
          {txid}
        </a>
      )
    }
  }
]

// Data table component
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const currency = (row.original as any).wallet.currency
      const searchValue = filterValue.toLowerCase()
      return currency.name.toLowerCase().includes(searchValue) || 
             currency.symbol.toLowerCase().includes(searchValue)
    },
    state: {
      pagination: { pageIndex, pageSize },
      globalFilter,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter by coin name or symbol..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No deposits found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} deposit(s) total
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(old => Math.max(0, old - 1))}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(old => old + 1)}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}