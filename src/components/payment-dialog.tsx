import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/constants";
import { formatEGP, isValidAmount } from "@/lib/money";
import { recordPayment } from "@/lib/server/payments";

export function PaymentDialog({
  open,
  onOpenChange,
  orderId,
  remaining,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  remaining: string;
}) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState(remaining);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      recordPayment({
        data: { orderId, amount, paymentMethod: method, notes: notes || undefined },
      }),
    onSuccess: () => {
      toast.success("Payment recorded");
      void qc.invalidateQueries();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not record payment"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            Remaining on this order is {formatEGP(remaining)}. Remaining and COD
            update automatically.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isValidAmount(amount)) {
              toast.error("Enter a valid amount");
              return;
            }
            mutation.mutate();
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="amount">Amount (EGP)</Label>
            <Input
              id="amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
