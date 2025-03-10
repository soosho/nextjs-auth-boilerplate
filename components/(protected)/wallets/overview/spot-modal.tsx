import { Currency } from "@/types/wallet"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CurrencyIcon } from "./currency-icon"

interface SpotModalProps {
  currency: Currency | null
  isOpen: boolean
  onClose: () => void
}

export function SpotModal({ currency, isOpen, onClose }: SpotModalProps) {
  if (!currency) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-3">
              <CurrencyIcon symbol={currency.symbol} name={currency.name} />
              <div className="flex flex-col">
                <span>{currency.name}</span>
                <span className="text-sm text-muted-foreground">
                  {currency.symbol}
                </span>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            View wallet details and network information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Price</h4>
            <p className="text-2xl font-mono">
              ${currency.price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Network</h4>
            <p className="text-sm">
              {currency.blockchain?.name || 'No network information'}
            </p>
          </div>

          <div className="pt-4">
            <Button className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}