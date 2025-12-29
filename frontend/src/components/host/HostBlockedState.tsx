import { Ban, Mail, AlertOctagon } from "lucide-react";
import { Link } from "react-router-dom";

const HostBlockedState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4 py-12">
      <div className="max-w-md w-full rounded-2xl p-8 text-center bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-lg)]">
        
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-[var(--badge-error-bg)]">
          <Ban className="w-10 h-10 text-[var(--status-error)]" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold mb-3 text-[var(--heading-primary)]">
          Hosting Privileges Blocked
        </h1>

        {/* Description */}
        <p className="mb-6 leading-relaxed text-[var(--text-secondary)]">
          Your hosting privileges have been blocked by the admin. You cannot create or manage events at this time.
        </p>

        {/* Info Box */}
        <div className="rounded-xl p-4 mb-6 bg-[var(--badge-error-bg)] border border-[var(--badge-error-border)]">
          <div className="flex items-start gap-3 text-left">
            <AlertOctagon className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--badge-error-text)]" />
            <p className="text-sm text-[var(--badge-error-text)]">
              All host actions have been disabled. Please contact admin to resolve this issue and restore your hosting privileges.
            </p>
          </div>
        </div>

        {/* Disabled Button */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold opacity-50 cursor-not-allowed mb-4 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]"
        >
          <Mail className="w-5 h-5" />
          Contact Admin
        </button>

        {/* Footer */}
        <p className="text-sm text-[var(--text-tertiary)]">
          Email: admin@eventhost.com
        </p>
      </div>
    </div>
  );
};

export default HostBlockedState;
