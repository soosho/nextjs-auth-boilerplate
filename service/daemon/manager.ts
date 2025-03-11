import { prisma } from "@/lib/prisma"
import { BaseDaemon } from "./base"

export class DaemonManager {
  private daemons: Map<string, BaseDaemon> = new Map()

  async initialize(): Promise<void> {
    try {
      const blockchains = await prisma.blockchain.findMany({
        where: { status: 'active' },
        include: {
          currencies: {
            where: { status: 'active' }
          }
        }
      })

      for (const blockchain of blockchains) {
        if (!blockchain.currencies.length) continue

        const name = blockchain.name.toLowerCase()
        console.log(`Looking for daemon implementation: ${name}`)

        try {
          // Try to import the daemon implementation
          const { default: DaemonClass } = await import(`./${name}`)
          
          if (DaemonClass && !this.daemons.has(blockchain.name)) {
            console.log(`Initializing daemon for ${blockchain.name}...`)
            const daemon = new DaemonClass()
            this.daemons.set(blockchain.name, daemon)
          }
        } catch (error) {
          console.error(`Failed to load daemon for ${blockchain.name}:`, error)
        }
      }

      const loadedDaemons = Array.from(this.daemons.keys())
      console.log(`Initialized daemons: ${loadedDaemons.length ? loadedDaemons.join(', ') : 'none'}`)
    } catch (error) {
      console.error('Failed to initialize daemons:', error)
      throw error
    }
  }

  async startAll(interval = 60000): Promise<void> {
    await this.initialize()

    for (const [name, daemon] of this.daemons) {
      console.log(`Starting ${name} daemon...`)
      await daemon.startMonitoring(interval)
    }
  }

  getDaemon(blockchain: string): BaseDaemon | null {
    return this.daemons.get(blockchain.toLowerCase()) || null
  }
}

// Export singleton instance
export const daemonManager = new DaemonManager()