export interface Currency {
  id: number
  name: string
  symbol: string
  type: string
  price: number
  blockchain: {
    name: string
  } | null
}

export interface Wallet {
  id: number
  currencyId: number
  spot_balance: number
  trading_balance: number
  funding_balance: number
  currency: Currency
}

export interface WalletsData {
  wallets: Wallet[]
  currencies: Currency[]
}