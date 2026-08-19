// frontend/src/components/user/user-events/CancelEventModal.tsx
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface CancelEventModalProps {
   isOpen: boolean;
   isCancelling: boolean;
   cancelReason: string;
   onReasonChange: (reason: string) => void;
   onClose: () => void;
   onConfirm: () => void;
}

export function CancelEventModal({
   isOpen,
   isCancelling,
   cancelReason,
   onReasonChange,
   onClose,
   onConfirm,
}: CancelEventModalProps) {
   return (
      <Modal isOpen={isOpen} onClose={onClose} title="Cancel Event" size="md">
         <div className="space-y-4">
            <p className="text-sm text-(--text-secondary)">
               Are you sure you want to cancel this event? This action cannot be undone, and all confirmed bookings will be refunded automatically.
            </p>
            <div className="space-y-2">
               <label className="text-sm font-semibold text-(--text-primary)">
                  Reason for Cancellation <span className="text-(--status-error)">*</span>
               </label>
               <textarea
                  className="w-full min-h-24 rounded-lg border border-(--form-input-border) bg-(--form-input-bg) px-3 py-2 text-sm text-(--form-input-text) shadow-sm placeholder:text-(--form-placeholder) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-primary-light)"
                  placeholder="Please provide a reason to notify your attendees..."
                  value={cancelReason}
                  onChange={(e) => onReasonChange(e.target.value)}
                  disabled={isCancelling}
               />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-(--border-default) mt-2">
               <Button variant="outline" onClick={onClose} disabled={isCancelling} className="border-(--border-strong) text-(--text-primary) hover:bg-(--bg-secondary)">
                  Keep Event
               </Button>
               <Button variant="destructive" onClick={onConfirm} disabled={isCancelling || cancelReason.trim() === ""} className="bg-(--status-error) text-white hover:bg-(--status-error-hover)">
                  {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm Cancellation
               </Button>
            </div>
         </div>
      </Modal>
   );
}