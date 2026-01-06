// frontend/src/components/admin/reject-host-modal.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/text-area";
import { hostRejectSchema } from "@/schemas/host.schema";
import type { HostRejectFormData } from "@/schemas/host.schema";
import { FieldError } from "../ui/FieldError";


interface RejectHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectHostModal({
  isOpen,
  onClose,
  onConfirm,
}: RejectHostModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<HostRejectFormData>({
    resolver: zodResolver(hostRejectSchema),
  });

  const submitHandler = (data: HostRejectFormData) => {
    onConfirm(data.reason);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Reject Host Application"
      size="sm"
    >
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-(--text-secondary)">
            Rejection Reason
          </label>

          <TextArea
            {...register("reason")}
            placeholder="Explain why this host application is rejected..."
            className="mt-1 min-h-[120px]"
          />
            <FieldError message={errors?.reason?.message} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="destructive"
            disabled={isSubmitting}
          >
            Reject Host
          </Button>
        </div>
      </form>
    </Modal>
  );
}
