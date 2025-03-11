import { useState } from "react"
import { type Wallet, type Currency } from "@/types/wallet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletList } from "./wallet-list"

interface SpotWalletProps {
  totalBalance: number
  monthlyChange: number
  wallets: Wallet[]
  currencies: Currency[]
}

export function SpotWallet({ 
  totalBalance = 0, 
  monthlyChange = 0, 
  wallets = [], 
  currencies = [] 
}: SpotWalletProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  
  // Create a map of currencyId to wallet balances
  const walletBalances = wallets.reduce((acc, wallet) => {
    acc[wallet.currencyId] = {
      spot_balance: wallet.spot_balance,
      trading_balance: wallet.trading_balance,
      funding_balance: wallet.funding_balance
    }
    return acc
  }, {} as Record<number, { spot_balance: number, trading_balance: number, funding_balance: number }>)

  // Calculate total spot balance
  const totalSpotBalance = wallets.reduce((sum, wallet) => 
    sum + (wallet.spot_balance * wallet.currency.price), 0)

  const handleViewDetails = (currencyId: number) => {
    const currency = currencies.find(c => c.id === currencyId)
    setSelectedCurrency(currency || null)
  }

  const handleCloseModal = () => {
    setSelectedCurrency(null)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyChange > 0 ? "+" : ""}{monthlyChange}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>
            A list of your wallets and their balances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WalletList 
            currencies={currencies} 
            wallets={walletBalances} 
          />
        </CardContent>
      </Card>
    </div>
  )
}