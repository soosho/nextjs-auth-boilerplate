'use client'

import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Copy } from "lucide-react"
import Image from "next/image"
import type { CurrencyWalletResponse } from "@/lib/wallets"
import { generateAddress } from "./actions"
import { useTransition, useState } from "react"
import { toast } from "sonner"

interface DepositContentProps {
  currency: CurrencyWalletResponse['currency']
  wallet: CurrencyWalletResponse['wallet']
}

export function DepositContent({ currency, wallet }: DepositContentProps) {
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)

  const handleCopy = (text: string | null) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const handleGenerateAddress = () => {
    setLoading(true)
    startTransition(async () => {
      try {
        await generateAddress(currency.symbol)
        toast.success('Address generated successfully')
      } catch (error) {
        toast.error('Failed to generate address')
        console.error('Failed to generate address:', error)
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <Card className="w-full overflow-hidden">
      <div className="flex flex-col items-center py-8 text-center bg-muted/10">
        <div className="mb-6">
          <Image
            src={`/icons/coins/${currency.symbol}.webp`}
            alt={currency.name}
            width={90}
            height={90}
            priority
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Deposit {currency.name}</h1>
          <p className="text-lg text-muted-foreground">{currency.symbol}</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <CardTitle>Deposit Address</CardTitle>
          <CardDescription>
            Send your {currency.symbol} only through {currency.blockchain?.name} network
          </CardDescription>
        </div>

        {wallet?.address ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <div className="flex gap-2">
                <Input value={wallet.address} readOnly className="font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(wallet.address!)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {wallet.memo && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Memo (Required)</label>
                <div className="flex gap-2">
                  <Input value={wallet.memo} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => wallet.memo && handleCopy(wallet.memo)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div className="flex justify-between items-center border-b pb-2">
                  <span>Deposit Fee:</span>
                  <span className="font-medium">{currency.deposit_fee} {currency.symbol}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span>Minimum Deposit:</span>
                  <span className="font-medium">{currency.min_deposit_amount} {currency.symbol}</span>
                </div>
                <div className="pt-2 space-y-2">
                  <p>• Only send {currency.symbol} through {currency.blockchain?.name} network</p>
                  <p>• Sending through other networks may result in permanent loss</p>
                </div>
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No deposit address found. Generate one to start depositing.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button
                onClick={handleGenerateAddress}
                disabled={isPending || loading}
                className="w-full md:w-auto"
              >
                {(isPending || loading) ? (
                  <>Generating...</>
                ) : (
                  <>Generate Deposit Address</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}