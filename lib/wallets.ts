import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import type { WalletsData } from "@/types/wallet"

// Remove WalletResponse interface since we'll use WalletsData

export interface CurrencyWalletResponse {
  currency: {
    id: number
    name: string
    symbol: string
    type: string
    price: number
    blockchainId: number | null
    price_api: string | null
    decimal: number
    deposit_fee: number
    min_deposit_amount: number
    min_collection_amount: number
    min_withdraw_amount: number
    withdraw_limit_24h: number
    withdraw_limit_72h: number
    website: string | null
    explorer: string | null
    bitcointalk: string | null
    twitter: string | null
    discord: string | null
    telegram: string | null
    status: string
    created_at: Date
    updated_at: Date
    blockchain: {
      name: string
      explorer_address: string | null
      explorer_transaction: string | null
      min_confirmations: number
    } | null
  }
  wallet: {
    id: number
    currencyId: number
    userId: string
    name: string | null
    address: string | null
    memo: string | null
    spot_balance: number
    trading_balance: number
    funding_balance: number
    created_at: Date
    updated_at: Date
  } | null
}

export async function getWallets(): Promise<WalletsData> {
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
        userId: true,
        name: true,
        address: true,
        memo: true,
        spot_balance: true,
        trading_balance: true,
        funding_balance: true,
        created_at: true,
        updated_at: true,
        currency: {
          select: {
            id: true,
            name: true,
            symbol: true,
            type: true,
            price: true,
            blockchainId: true,
            price_api: true,
            decimal: true,
            deposit_fee: true,
            min_deposit_amount: true,
            min_collection_amount: true,
            min_withdraw_amount: true,
            withdraw_limit_24h: true,
            withdraw_limit_72h: true,
            website: true,
            explorer: true,
            bitcointalk: true,
            twitter: true,
            discord: true,
            telegram: true,
            status: true,
            created_at: true,
            updated_at: true,
            blockchain: {
              select: {
                name: true,
                explorer_address: true,
                explorer_transaction: true,
                min_confirmations: true
              }
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
        blockchainId: true,
        price_api: true,
        decimal: true,
        deposit_fee: true,
        min_deposit_amount: true,
        min_collection_amount: true,
        min_withdraw_amount: true,
        withdraw_limit_24h: true,
        withdraw_limit_72h: true,
        website: true,
        explorer: true,
        bitcointalk: true,
        twitter: true,
        discord: true,
        telegram: true,
        status: true,
        created_at: true,
        updated_at: true,
        blockchain: {
          select: {
            name: true,
            explorer_address: true,
            explorer_transaction: true,
            min_confirmations: true
          }
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
      currency: {
        ...w.currency,
        price: Number(w.currency.price),
        deposit_fee: Number(w.currency.deposit_fee),
        min_deposit_amount: Number(w.currency.min_deposit_amount),
        min_collection_amount: Number(w.currency.min_collection_amount),
        min_withdraw_amount: Number(w.currency.min_withdraw_amount),
        withdraw_limit_24h: Number(w.currency.withdraw_limit_24h),
        withdraw_limit_72h: Number(w.currency.withdraw_limit_72h)
      }
    })),
    currencies: currencies.map(c => ({
      ...c,
      price: Number(c.price),
      deposit_fee: Number(c.deposit_fee),
      min_deposit_amount: Number(c.min_deposit_amount),
      min_collection_amount: Number(c.min_collection_amount),
      min_withdraw_amount: Number(c.min_withdraw_amount),
      withdraw_limit_24h: Number(c.withdraw_limit_24h),
      withdraw_limit_72h: Number(c.withdraw_limit_72h)
    }))
  }
}

export async function getCurrencyAndWallet(symbol: string): Promise<CurrencyWalletResponse | null> {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const currency = await prisma.currency.findFirst({
    where: {
      symbol: symbol.toUpperCase(),
      status: "active"
    },
    include: {
      blockchain: true
    }
  })

  if (!currency) return null

  const wallet = await prisma.wallet.findFirst({
    where: {
      userId: session.user.id,
      currencyId: currency.id
    }
  })

  return {
    currency: {
      ...currency,
      price: Number(currency.price),
      deposit_fee: Number(currency.deposit_fee),
      min_deposit_amount: Number(currency.min_deposit_amount),
      min_collection_amount: Number(currency.min_collection_amount),
      min_withdraw_amount: Number(currency.min_withdraw_amount),
      withdraw_limit_24h: Number(currency.withdraw_limit_24h),
      withdraw_limit_72h: Number(currency.withdraw_limit_72h)
    },
    wallet: wallet ? {
      ...wallet,
      spot_balance: Number(wallet.spot_balance),
      trading_balance: Number(wallet.trading_balance),
      funding_balance: Number(wallet.funding_balance)
    } : null
  }
}