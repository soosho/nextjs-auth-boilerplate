import { Wallet } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

export function serializeWallet(wallet: Wallet): Wallet {
  return {
    ...wallet,
    spot_balance: new Decimal(wallet.spot_balance.toString()),
    trading_balance: new Decimal(wallet.trading_balance.toString()),
    funding_balance: new Decimal(wallet.funding_balance.toString())
  }
}