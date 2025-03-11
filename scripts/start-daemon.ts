import { daemonManager } from "@/service/daemon/manager"

async function main() {
  try {
    console.log('Initializing blockchain daemons...')
    await daemonManager.startAll()
    console.log('All daemons started successfully')

    // Keep the process running
    process.on('SIGINT', () => {
      console.log('Stopping daemons...')
      process.exit(0)
    })
  } catch (error) {
    console.error('Failed to start daemons:', error)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})