'use server'

import { auth } from "@/auth"
import { blockchainDaemon } from "@/service/daemon/decord"
import { revalidatePath } from "next/cache"
import { getCurrencyAndWallet } from "@/lib/wallets"

export async function generateAddress(symbol: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const data = await getCurrencyAndWallet(symbol)
  if (!data?.currency) {
    throw new Error('Currency not found')
  }

  const wallet = await blockchainDaemon.generateDepositAddress(session.user.id)
  if (!wallet) {
    throw new Error('Failed to generate address')
  }

  revalidatePath(`/wallets/${symbol}/deposit`)
  return wallet
}