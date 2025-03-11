import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

interface WalletTotalResponse {
  totalBalance: number
  walletLink: string
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const wallets = await prisma.wallet.findMany({
      where: { userId: session.user.id },
      include: {
        currency: {
          select: {
            price: true
          }
        }
      }
    })

    const totalBalance = wallets.reduce((sum, wallet) => {
      const balance = Number(wallet.spot_balance) + 
                     Number(wallet.trading_balance) + 
                     Number(wallet.funding_balance)
      return sum + (balance * Number(wallet.currency.price))
    }, 0)

    const response: WalletTotalResponse = {
      totalBalance,
      walletLink: "/wallets/overview"
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[WALLET_TOTAL_BALANCE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}