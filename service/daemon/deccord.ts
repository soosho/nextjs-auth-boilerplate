import { prisma } from "@/lib/prisma"
import type { Wallet, Blockchain, Currency } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"
import { BaseDaemon } from "./base"
import { serializeWallet } from "@/lib/utils/serialize"

interface BlockchainConfig {
  rpcUrl: string
  auth?: {
    username: string
    password: string
  }
  wallet?: string
  networkName: string
  decimals: number
  minConfirmations: number
}

export default class DeccordDaemon extends BaseDaemon {
  constructor() {
    super('deccord')
  }

  private async updateBlockchainHeight(): Promise<void> {
    try {
      const blockCount = await this.rpcCall('getblockcount', [])
      
      await this.prisma.blockchain.update({
        where: {
          name: this.blockchainName
        },
        data: {
          height: BigInt(blockCount),
          last_checked: new Date()
        }
      })

      console.log(`Updated blockchain height: ${blockCount} (${this.blockchainName})`)
    } catch (error) {
      console.error('Failed to update blockchain height:', error)
    }
  }

  /**
   * Generate a new deposit address for a user
   */
  async generateDepositAddress(userId: string): Promise<Wallet | null> {
    try {
      const { config, currencyId } = await this.getConfig()

      console.log('Generating new address for user:', userId)

      // First check if wallet exists
      const existingWallet = await prisma.wallet.findFirst({
        where: {
          userId,
          currencyId,
        }
      })

      const address = await this.rpcCall('getnewaddress', [userId])
      
      if (!address) {
        throw new Error('RPC returned empty address')
      }

      console.log('Generated address:', address)

      const now = new Date()

      if (existingWallet) {
        // Update existing wallet
        const wallet = await prisma.wallet.update({
          where: {
            id: existingWallet.id
          },
          data: {
            address,
            memo: null,
            updated_at: now
          }
        })

        // Serialize before returning
        return serializeWallet(wallet)
      } else {
        // Create new wallet with Decimal values
        const wallet = await prisma.wallet.create({
          data: {
            userId,
            currencyId,
            name: config.networkName,
            address,
            memo: null,
            created_at: now,
            updated_at: now,
            funding_balance: new Decimal(0),
            spot_balance: new Decimal(0),
            trading_balance: new Decimal(0)
          }
        })

        // Serialize before returning
        return serializeWallet(wallet)
      }
    } catch (error) {
      console.error('Failed to generate deposit address:', error)
      if (error instanceof Error) {
        throw new Error(`Failed to generate deposit address: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Validate an address
   */
  validateAddress(address: string): boolean {
    return address.startsWith('D') && address.length === 42
  }

  /**
   * Get balance for an address
   */
  async getAddressBalance(address: string): Promise<number> {
    return 0
  }

  /**
   * Monitor deposits for an address
   */
  async monitorDeposits(): Promise<void> {
    try {
      const { config } = await this.getConfig()
      await this.updateBlockchainHeight()

      // Get all active wallet addresses
      const activeWallets = await this.prisma.wallet.findMany({
        where: {
          currency: {
            status: 'active',
            blockchain: { name: this.blockchainName }
          }
        },
        select: {
          id: true,
          address: true,
          currency: { select: { symbol: true } }
        }
      })

      console.log(`Checking transactions for ${activeWallets.length} ${this.blockchainName} wallets`)

      const transactions = await this.rpcCall('listtransactions', ['*', 100])

      // Only log if there are transactions to process
      if (transactions.length > 0) {
        console.log(`Found ${transactions.length} transactions on ${this.blockchainName}`)
      }

      const walletMap = new Map(
        activeWallets.map(w => [w.address, { id: w.id, symbol: w.currency.symbol }])
      )

      for (const tx of transactions) {
        if (tx.category !== 'receive') continue

        const walletInfo = walletMap.get(tx.address)
        if (!walletInfo) continue

        const existingDeposit = await this.prisma.deposit.findUnique({
          where: { txid: tx.txid }
        })

        const now = new Date()

        if (existingDeposit) {
          await this.updateExistingDeposit(existingDeposit, tx, walletInfo, config.minConfirmations)
          continue
        }

        await this.processNewDeposit(tx, walletInfo, config.minConfirmations)
      }
    } catch (error) {
      console.error(`Failed to monitor ${this.blockchainName} deposits:`, error)
      throw error
    }
  }

  private async updateExistingDeposit(
    existingDeposit: any,
    tx: any,
    walletInfo: { id: number; symbol: string },
    minConfirmations: number
  ): Promise<void> {
    const now = new Date()
    
    if (existingDeposit.confirmations !== tx.confirmations) {
      const newStatus = tx.confirmations >= minConfirmations ? 'confirmed' : 'pending'
      
      await this.prisma.deposit.update({
        where: { id: existingDeposit.id },
        data: { 
          confirmations: tx.confirmations,
          status: newStatus,
          updated_at: now
        }
      })

      if (newStatus === 'confirmed' && existingDeposit.status !== 'confirmed' && !existingDeposit.credited) {
        await this.creditDeposit(walletInfo.id, tx.amount, walletInfo.symbol, existingDeposit.id)
      }
    }
  }

  private async processNewDeposit(
    tx: any,
    walletInfo: { id: number; symbol: string },
    minConfirmations: number
  ): Promise<void> {
    const now = new Date()
    const status = tx.confirmations >= minConfirmations ? 'confirmed' : 'pending'

    const deposit = await this.prisma.deposit.create({
      data: {
        walletId: walletInfo.id,
        txid: tx.txid,
        amount: new Decimal(tx.amount),
        confirmations: tx.confirmations,
        status,
        credited: false,
        created_at: now,
        updated_at: now
      }
    })

    if (status === 'confirmed') {
      await this.creditDeposit(walletInfo.id, tx.amount, walletInfo.symbol, deposit.id)
    }
  }

  private async creditDeposit(
    walletId: number,
    amount: number,
    symbol: string,
    depositId: number
  ): Promise<void> {
    const now = new Date()

    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: walletId },
        data: {
          spot_balance: { increment: amount },
          updated_at: now
        }
      }),
      this.prisma.deposit.update({
        where: { id: depositId },
        data: {
          credited: true,
          updated_at: now
        }
      })
    ])

    console.log(`[${this.blockchainName}] Credited ${amount} ${symbol} to wallet ${walletId}`)
  }

  async startMonitoring(interval = 60000): Promise<void> {
    console.log(`Starting ${this.blockchainName} deposit monitoring...`)
    
    const monitor = async () => {
      await this.monitorDeposits()
      setTimeout(monitor, interval)
    }

    monitor().catch(error => {
      console.error(`${this.blockchainName} monitoring failed:`, error)
    })
  }

  async processWithdrawal(userId: string, toAddress: string, amount: number): Promise<boolean> {
    // TODO: Implement withdrawal logic
    return false
  }
}