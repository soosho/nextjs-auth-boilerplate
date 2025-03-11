import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { DataTable, columns } from "@/components/(protected)/wallets/history/deposit/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Decimal } from "@prisma/client/runtime/library"
import type { Deposit } from "@/components/(protected)/wallets/history/deposit/data-table"

export const metadata = {
  title: 'Deposit History'
}

function serializeDecimals<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (obj instanceof Decimal) {
    return obj.toNumber() as T
  }

  if (obj instanceof Date) {
    return obj.toISOString() as T
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDecimals) as T
  }

  if (typeof obj === 'object') {
    const result = {} as T
    for (const [key, value] of Object.entries(obj)) {
      result[key as keyof T] = serializeDecimals(value)
    }
    return result
  }

  return obj
}

export default async function DepositHistoryPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const rawDeposits = await prisma.deposit.findMany({
    where: {
      wallet: {
        userId: session.user.id
      }
    },
    include: {
      wallet: {
        include: {
          currency: {
            include: {
              blockchain: true
            }
          }
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  })

  // Type assertion after serialization
  const deposits = serializeDecimals(rawDeposits) as unknown as Deposit[]

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Deposit History</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Deposits</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={deposits} />
        </CardContent>
      </Card>
    </div>
  )
}