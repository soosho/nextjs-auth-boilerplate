import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getWallets() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const [wallets, currencies] = await Promise.all([
    prisma.wallet.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        currencyId: true,
        spot_balance: true,
        trading_balance: true,
        funding_balance: true,
        currency: {
          select: {
            id: true,
            name: true,
            symbol: true,
            type: true,
            price: true,
            blockchain: {
              select: { name: true }
            }
          }
        }
      }
    }),
    prisma.currency.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        symbol: true,
        type: true,
        price: true,
        blockchain: {
          select: { name: true }
        }
      },
      orderBy: { symbol: 'asc' }
    })
  ])

  return { 
    wallets: wallets.map(w => ({
      ...w,
      spot_balance: Number(w.spot_balance),
      trading_balance: Number(w.trading_balance),
      funding_balance: Number(w.funding_balance),
      currency: { ...w.currency, price: Number(w.currency.price) }
    })),
    currencies: currencies.map(c => ({ ...c, price: Number(c.price) }))
  }
}