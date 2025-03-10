"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpotWallet } from "./spot"
import { type WalletsData } from "@/types/wallet"

interface WalletOverviewMainProps {
  initialData: WalletsData
}

export function WalletOverviewMain({ initialData }: WalletOverviewMainProps) {
  const [activeTab, setActiveTab] = useState("spot")
  const spotWallets = initialData.wallets.filter(w => w.spot_balance > 0)
  const totalSpotBalance = spotWallets.reduce((sum, wallet) => 
    sum + (wallet.spot_balance * wallet.currency.price), 0)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Wallets</h2>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="spot">Spot Wallet</TabsTrigger>
          <TabsTrigger value="trading">Trading Wallet</TabsTrigger>
          <TabsTrigger value="funding">Funding Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="spot" className="space-y-4">
          <SpotWallet 
            totalBalance={totalSpotBalance} 
            monthlyChange={0}
            wallets={spotWallets}
            currencies={initialData.currencies}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}