import { prisma } from "@/lib/prisma"
import type { Wallet } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

export interface BlockchainConfig {
  rpcUrl: string
  auth?: {
    username: string
    password: string
  }
  wallet?: string
  networkName: string
  minConfirmations: number
}

export abstract class BaseDaemon {
  private config: BlockchainConfig | null = null
  private currencyId: number | null = null
  protected readonly prisma = prisma
  protected readonly blockchainName: string

  constructor(blockchainName: string) {
    this.blockchainName = blockchainName
  }

  abstract monitorDeposits(): Promise<void>
  abstract startMonitoring(interval?: number): Promise<void>
  abstract processWithdrawal(userId: string, toAddress: string, amount: number): Promise<boolean>

  protected async initConfig(): Promise<void> {
    if (this.config) return

    const currency = await this.prisma.currency.findFirst({
      where: {
        status: 'active',
        blockchain: {
          name: this.blockchainName,
          status: 'active'
        }
      },
      include: {
        blockchain: true
      }
    })

    if (!currency?.blockchain) {
      throw new Error('Currency or blockchain configuration not found')
    }

    const { blockchain } = currency
    if (!blockchain.host || !blockchain.port) {
      throw new Error('Incomplete blockchain configuration')
    }

    const baseUrl = `http://${blockchain.host}:${blockchain.port}`
    const walletName = blockchain.wallet_name || 'personal'

    this.config = {
      rpcUrl: baseUrl,
      wallet: walletName,
      auth: blockchain.username && blockchain.password ? {
        username: blockchain.username,
        password: blockchain.password
      } : undefined,
      networkName: blockchain.name,
      minConfirmations: blockchain.min_confirmations
    }

    this.currencyId = currency.id
  }

  protected async getConfig(): Promise<{ config: BlockchainConfig; currencyId: number }> {
    if (!this.config || !this.currencyId) {
      await this.initConfig()
    }
    if (!this.config || !this.currencyId) {
      throw new Error(`Failed to initialize blockchain configuration for ${this.blockchainName}`)
    }
    return { config: this.config, currencyId: this.currencyId }
  }

  protected async rpcCall(method: string, params: any[] = []): Promise<any> {
    const { config } = await this.getConfig()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (config.auth) {
      const authString = Buffer.from(
        `${config.auth.username}:${config.auth.password}`
      ).toString('base64')
      headers['Authorization'] = `Basic ${authString}`
    }

    const rpcUrl = `${config.rpcUrl}/wallet/${config.wallet}`

    try {
      // Remove verbose RPC logging
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params
        })
      })

      if (!response.ok) {
        throw new Error(`RPC call failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(`RPC error: ${data.error.message || JSON.stringify(data.error)}`)
      }

      return data.result
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`RPC call to ${method} failed: ${error.message}`)
      }
      throw error
    }
  }

  async generateDepositAddress(userId: string): Promise<Wallet | null> {
    try {
      const { config, currencyId } = await this.getConfig()

      const existingWallet = await this.prisma.wallet.findFirst({
        where: { userId, currencyId }
      })

      const address = await this.rpcCall('getnewaddress', [userId])
      if (!address) {
        throw new Error('RPC returned empty address')
      }

      const now = new Date()

      if (existingWallet) {
        return await this.prisma.wallet.update({
          where: { id: existingWallet.id },
          data: {
            address,
            memo: null,
            updated_at: now
          }
        })
      }

      return await this.prisma.wallet.create({
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
    } catch (error) {
      console.error('Failed to generate deposit address:', error)
      throw error
    }
  }
}