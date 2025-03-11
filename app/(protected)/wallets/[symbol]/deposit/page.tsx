import { notFound } from "next/navigation"
import { getCurrencyAndWallet } from "@/lib/wallets"
import { DepositContent } from "./deposit-content"

type PageProps = {
  params: Promise<{
    symbol: string
  }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DepositPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams
  ])
  
  const data = await getCurrencyAndWallet(resolvedParams.symbol)
  if (!data) return notFound()

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="max-w-3xl mx-auto w-full">
        <DepositContent 
          currency={data.currency} 
          wallet={data.wallet} 
        />
      </div>
    </div>
  )
}
