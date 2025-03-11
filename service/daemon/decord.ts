import { prisma } from "@/lib/prisma"
import type { Wallet, Blockchain, Currency } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

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

export class BlockchainDaemon {
  private config: BlockchainConfig | null = null
  private currencyId: number | null = null

  private async initConfig(): Promise<void> {
    if (this.config) return

    // First get the currency with its blockchain
    const currency = await prisma.currency.findFirst({
      where: {
        status: 'active'
      },
      include: {
        blockchain: true
      }
    }) as Currency & { blockchain: Blockchain | null }

    if (!currency?.blockchain) {
      throw new Error('Currency or blockchain configuration not found')
    }

    const { blockchain } = currency
    if (!blockchain.host || !blockchain.port) {
      throw new Error('Incomplete blockchain configuration')
    }

    // Base RPC URL without wallet path
    const baseUrl = `http://${blockchain.host}:${blockchain.port}`
    
    // Get wallet name from blockchain config or use default
    const walletName = blockchain.wallet_name || 'wallet'

    this.config = {
      rpcUrl: baseUrl,
      wallet: walletName,
      auth: blockchain.username && blockchain.password ? {
        username: blockchain.username,
        password: blockchain.password
      } : undefined,
      networkName: blockchain.name,
      decimals: currency.decimal,
      minConfirmations: blockchain.min_confirmations
    }

    this.currencyId = currency.id
  }

  private async ensureConfig(): Promise<{ config: BlockchainConfig; currencyId: number }> {
    if (!this.config || !this.currencyId) {
      await this.initConfig()
    }
    if (!this.config || !this.currencyId) {
      throw new Error('Failed to initialize blockchain configuration')
    }
    return { config: this.config, currencyId: this.currencyId }
  }

  private async rpcCall(method: string, params: any[] = []): Promise<any> {
    const { config } = await this.ensureConfig()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add Basic Auth header if credentials exist
    if (config.auth) {
      const authString = Buffer.from(
        `${config.auth.username}:${config.auth.password}`
      ).toString('base64')
      headers['Authorization'] = `Basic ${authString}`
    }

    // Add wallet name to URL path
    const rpcUrl = `${config.rpcUrl}/wallet/${config.wallet}`

    try {
      console.log(`Making RPC call to ${rpcUrl}`, {
        method: method,
        params: params,
        headers: {
          ...headers,
          Authorization: headers.Authorization ? '[REDACTED]' : undefined
        }
      })

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('RPC call failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`RPC call failed: ${response.status} ${response.statusText}\n${errorText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        console.error('RPC error response:', data.error)
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

  /**
   * Generate a new deposit address for a user
   */
  async generateDepositAddress(userId: string): Promise<Wallet | null> {
    try {
      const { config, currencyId } = await this.ensureConfig()

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

        return wallet // Return Prisma object directly
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

        return wallet // Return Prisma object directly
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
    // TODO: Implement actual address validation
    return address.startsWith('dcd1') && address.length === 42
  }

  /**
   * Get balance for an address
   */
  async getAddressBalance(address: string): Promise<number> {
    try {
      // TODO: Implement actual balance checking with node
      return 0
    } catch (error) {
      console.error('Failed to get balance:', error)
      return 0
    }
  }

  /**
   * Monitor deposits for an address
   */
  async monitorDeposits(address: string): Promise<void> {
    try {
      // TODO: Implement deposit monitoring
      // This should:
      // 1. Connect to node
      // 2. Watch for incoming transactions
      // 3. Verify confirmations
      // 4. Update user balance when confirmed
    } catch (error) {
      console.error('Failed to monitor deposits:', error)
    }
  }

  /**
   * Process a withdrawal
   */
  async processWithdrawal(
    userId: string,
    toAddress: string,
    amount: number
  ): Promise<boolean> {
    try {
      // TODO: Implement withdrawal processing
      // This should:
      // 1. Verify user has sufficient balance
      // 2. Lock the amount
      // 3. Submit transaction to node
      // 4. Monitor for confirmation
      // 5. Update user balance when confirmed
      return false
    } catch (error) {
      console.error('Failed to process withdrawal:', error)
      return false
    }
  }
}

// Export a singleton instance
export const blockchainDaemon = new BlockchainDaemon()