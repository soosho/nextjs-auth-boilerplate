import { daemonManager } from "@/service/daemon/manager"
import { NextResponse } from "next/server"

let isRunning = false

export async function GET() {
  if (!isRunning) {
    console.log('Starting blockchain daemons...')
    await daemonManager.startAll()
    isRunning = true
    return NextResponse.json({ status: 'started' })
  }
  
  return NextResponse.json({ status: 'already running' })
}