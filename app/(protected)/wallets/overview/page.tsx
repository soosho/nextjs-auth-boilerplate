import { Suspense } from "react"
import { WalletOverviewMain } from "@/components/(protected)/wallets/overview/main"
import { getWallets } from "@/lib/wallets"
import WalletsLoading from "./loading"

export default async function WalletsOverview() {
  const walletsData = await getWallets()
  
  return (
    <Suspense fallback={<WalletsLoading />}>
      <WalletOverviewMain initialData={walletsData} />
    </Suspense>
  )
}