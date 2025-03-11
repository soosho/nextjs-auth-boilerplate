import { notFound } from "next/navigation"
import { getCurrencyAndWallet } from "@/lib/wallets"
import { DepositContent } from "./deposit-content"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type PageProps = {
  params: Promise<{
    symbol: string
  }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DepositPage({ params, searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) return notFound()

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams
  ])
  
  const data = await getCurrencyAndWallet(resolvedParams.symbol)
  if (!data) return notFound()

  // Get recent deposits for this currency
  const recentDeposits = await prisma.deposit.findMany({
    where: {
      wallet: {
        userId: session.user.id,
        currencyId: data.currency.id
      }
    },
    select: {
      id: true,
      txid: true,
      amount: true,
      status: true,
      confirmations: true,
      created_at: true,
      wallet: {
        select: {
          currency: {
            select: {
              blockchain: {
                select: {
                  explorer_transaction: true,
                  min_confirmations: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 10
  })

  const serializedDeposits = recentDeposits.map(deposit => ({
    ...deposit,
    amount: Number(deposit.amount),
    blockchain: deposit.wallet.currency.blockchain
  }))

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="max-w-3xl mx-auto w-full">
        <DepositContent 
          currency={data.currency} 
          wallet={data.wallet}
          recentDeposits={serializedDeposits}
        />
      </div>
    </div>
  )
}
