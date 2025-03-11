'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Copy, AlertTriangle } from "lucide-react";
import Image from "next/image";
import type { CurrencyWalletResponse } from "@/lib/wallets";
import { generateAddress } from "./actions";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { RecentDeposits } from "./recent-deposits";
import { QRCodeSVG } from "qrcode.react";

interface DepositContentProps {
  currency: CurrencyWalletResponse["currency"];
  wallet: CurrencyWalletResponse["wallet"];
  recentDeposits: any[];
}

export function DepositContent({ currency, wallet, recentDeposits }: DepositContentProps) {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const handleCopy = (text: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleGenerateAddress = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        await generateAddress(currency.symbol);
        toast.success("Address generated successfully");
      } catch (error) {
        toast.error("Failed to generate address");
        console.error("Failed to generate address:", error);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-3 p-4 bg-muted/10">
          <Image
            src={`/icons/coins/${currency.symbol}.webp`}
            alt={currency.name}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <CardTitle>{currency.name} Deposit</CardTitle>
            <p className="text-sm text-muted-foreground">{currency.symbol} • {currency.blockchain?.name} Network</p>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {wallet?.address ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <div className="border rounded-lg p-3 bg-white">
                  <QRCodeSVG value={wallet.address} size={160} level="H" className="rounded" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Scan QR Code</p>
              </div>

              <div className="col-span-2 space-y-4">
                <div className="border rounded-lg p-3 bg-muted/30">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Deposit Address</label>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm truncate flex-1">{wallet.address}</code>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(wallet.address!)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground">Deposit Fee</p>
                    <p className="font-medium">{currency.deposit_fee} {currency.symbol}</p>
                  </div>
                  <div className="border rounded-lg p-3 bg-muted/30">
                    <p className="text-xs text-muted-foreground">Minimum Amount</p>
                    <p className="font-medium">{currency.min_deposit_amount} {currency.symbol}</p>
                  </div>
                </div>

                <Alert variant="destructive" className="py-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Only send {currency.symbol} through {currency.blockchain?.name} network
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <Alert>
                <AlertTriangle className="h-5 w-5" />
                <AlertDescription>No deposit address found. Generate one to start depositing.</AlertDescription>
              </Alert>
              <Button onClick={handleGenerateAddress} disabled={isPending || loading} className="w-full md:w-auto">
                {isPending || loading ? "Generating..." : "Generate Deposit Address"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <RecentDeposits deposits={recentDeposits} symbol={currency.symbol} />
    </div>
  );
}
