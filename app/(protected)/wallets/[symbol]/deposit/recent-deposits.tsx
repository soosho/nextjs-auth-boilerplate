'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatAmount } from "@/lib/utils/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Deposit = {
  id: number
  txid: string
  amount: number
  status: string
  confirmations: number
  created_at: string
  blockchain: {
    explorer_transaction: string | null
    min_confirmations: number
  }
}

interface RecentDepositsProps {
  deposits: Deposit[]
  symbol: string
}

export function RecentDeposits({ deposits, symbol }: RecentDepositsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Deposits</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>TxID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deposits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No recent deposits
                </TableCell>
              </TableRow>
            ) : (
              deposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell>
                    {formatDate(new Date(deposit.created_at))}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAmount(deposit.amount)} {symbol}
                  </TableCell>
                  <TableCell>
                    {deposit.confirmations === 0 ? (
                      <Badge variant="outline">Initiated</Badge>
                    ) : deposit.confirmations < deposit.blockchain.min_confirmations ? (
                      <Badge variant="warning">
                        Confirming ({deposit.confirmations}/{deposit.blockchain.min_confirmations})
                      </Badge>
                    ) : (
                      <Badge variant="success">Confirmed</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">
                    {deposit.blockchain.explorer_transaction ? (
                      <a
                        href={`${deposit.blockchain.explorer_transaction}${deposit.txid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-600 truncate max-w-[200px]"
                      >
                        {deposit.txid}
                      </a>
                    ) : (
                      <span className="text-sm truncate max-w-[200px]">
                        {deposit.txid}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}