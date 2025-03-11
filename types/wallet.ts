export interface Currency {
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

export interface Wallet {
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
  currency: Currency
}

export interface WalletsData {
  wallets: Wallet[]
  currencies: Currency[]
}