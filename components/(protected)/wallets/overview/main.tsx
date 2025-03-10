"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpotWallet } from "./spot"

interface Wallet {
  id: number
  name: string | null
  address: string | null
  memo: string | null
  currency: {
    name: string
    symbol: string
    type: string
    blockchain: {
      name: string
    } | null
  }
}

export function WalletOverviewMain() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("spot")

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Wallets</h2>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="spot">Spot Wallet</TabsTrigger>
          <TabsTrigger value="trading">Trading Wallet</TabsTrigger>
          <TabsTrigger value="funding">Funding Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="spot" className="space-y-4">
          <SpotWallet totalBalance={0} monthlyChange={0} wallets={[]} />
        </TabsContent>

        <TabsContent value="trading" className="space-y-4">
          {/* Trading wallet content */}
        </TabsContent>

        <TabsContent value="funding" className="space-y-4">
          {/* Funding wallet content */}
        </TabsContent>
      </Tabs>
    </div>
  )
}