'use server'

import { auth } from "@/auth"
import { daemonManager } from "@/service/daemon/manager"
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

  const daemon = daemonManager.getDaemon(data.currency.blockchain?.name || '')
  if (!daemon) {
    throw new Error('No daemon implementation found for this currency')
  }

  const wallet = await daemon.generateDepositAddress(session.user.id)
  if (!wallet) {
    throw new Error('Failed to generate address')
  }

  revalidatePath(`/wallets/${symbol}/deposit`)
  return wallet
}