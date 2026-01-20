import { XCircle, RefreshCw, MessageSquare, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

interface HostRejectedStateProps {
  rejectionReason?: string;
}






const HostRejectedState = ({ rejectionReason }: HostRejectedStateProps) => {
  
  const navigate = useNavigate();


  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4 py-12">
      <div className="max-w-lg w-full rounded-2xl p-8 text-center bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-lg)]">
        
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-[var(--badge-error-bg)]">
          <XCircle className="w-10 h-10 text-[var(--status-error)]" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold mb-3 text-[var(--heading-primary)]">
          Application Rejected
        </h1>

        {/* Description */}
        <p className="mb-6 leading-relaxed text-[var(--text-secondary)]">
          Unfortunately, your application to become a host was not approved at this time.
        </p>

        {/* Rejection Reason */}
        {rejectionReason && (
          <div className="rounded-xl p-4 mb-6 text-left bg-[var(--badge-error-bg)] border border-[var(--badge-error-border)]">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--badge-error-text)]" />
              <div>
                <p className="font-medium text-sm mb-1 text-[var(--badge-error-text)]">
                  Reason for rejection:
                </p>
                <p className="text-sm text-[var(--badge-error-text)]">
                  {rejectionReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-xl p-4 mb-6 bg-[var(--badge-info-bg)] border border-[var(--badge-info-border)]">
          <p className="text-sm text-[var(--badge-info-text)]">
            You can re-apply after addressing the issues mentioned above. Make sure to provide complete and accurate information.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => {
              navigate('?reapply=true', { replace: true });
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="w-5 h-5" />
            Re-Apply for Host Role
          </Button>

          <Button
            variant="outline"
            asChild
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
          >
            <Link to ="/support">
              <MessageSquare className="w-5 h-5" />
              Contact Support
            </Link>
          </Button>
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-sm text-[var(--text-tertiary)]">
          Need help? Our support team is here to assist you
        </p>
      </div>
    </div>
  );
};

export default HostRejectedState;
