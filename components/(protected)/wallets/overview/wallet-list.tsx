import Image from "next/image"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Currency } from "@/types/wallet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CurrencyIcon } from "./currency-icon"

interface WalletListProps {
  currencies: Currency[]
  wallets: Record<number, {
    spot_balance: number
    trading_balance: number
    funding_balance: number
  }>
  onViewDetails: (currencyId: number) => void
}

export function WalletList({ currencies, wallets, onViewDetails }: WalletListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="text-right">Balance</TableHead>
          <TableHead className="text-right">Value</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currencies.map((currency) => {
          const wallet = wallets[currency.id] || { spot_balance: 0, trading_balance: 0, funding_balance: 0 }
          const value = wallet.spot_balance * currency.price

          return (
            <TableRow key={currency.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <CurrencyIcon 
                    symbol={currency.symbol} 
                    name={currency.name} 
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{currency.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {currency.symbol}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono">
                ${currency.price.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </TableCell>
              <TableCell className="text-right font-mono">
                {wallet.spot_balance.toLocaleString('en-US', {
                  minimumFractionDigits: 8,
                  maximumFractionDigits: 8
                })}
              </TableCell>
              <TableCell className="text-right font-mono">
                ${value.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetails(currency.id)}
                  className="h-8 w-8"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View {currency.name} details</span>
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}