import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;

  loading?: boolean;

  title?: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;

  variant?: "default" | "danger";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmationModalProps) {
  const isDanger = variant === "danger";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {isDanger ? (
            <AlertTriangle className="h-6 w-6 text-(--status-error)" />
          ) : (
            <CheckCircle className="h-6 w-6 text-(--status-success)" />
          )}

          <p className="text-(--text-secondary)">
            {description}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={isDanger ? "destructive" : "default"}
            // onClick={() => {
            //   onConfirm();
            // //   onClose();
            // }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
