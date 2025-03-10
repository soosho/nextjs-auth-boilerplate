import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SpotWalletProps {
  totalBalance: number
  monthlyChange: number
  wallets: any[] // TODO: Add proper wallet type
}

export function SpotWallet({ totalBalance = 0, monthlyChange = 0, wallets = [] }: SpotWalletProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
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
          {wallets.length > 0 ? (
            <div className="space-y-4">
              {/* TODO: Add wallet list component */}
              <p>Wallet list coming soon...</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No assets found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}