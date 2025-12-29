import { ShieldX, Mail, HelpCircle } from "lucide-react";

const BlockedAccountMessage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4 py-12">
      <div
        className="max-w-md w-full rounded-2xl p-8 text-center
                   bg-[var(--card-bg)]
                   border border-[var(--card-border)]
                   shadow-[var(--shadow-lg)]"
      >
        {/* Icon */}
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center
                     bg-[var(--badge-error-bg)]"
        >
          <ShieldX className="w-10 h-10 text-[var(--status-error)]" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold mb-3 text-[var(--heading-primary)]">
          Account Blocked
        </h1>

        {/* Description */}
        <p className="mb-6 leading-relaxed text-[var(--text-secondary)]">
          Your account has been blocked due to a policy violation. All actions have been disabled.
        </p>

        {/* Info Box */}
        <div
          className="rounded-xl p-4 mb-6
                     bg-[var(--badge-error-bg)]
                     border border-[var(--badge-error-border)]"
        >
          <p className="text-sm text-[var(--badge-error-text)]">
            If you believe this is an error, please contact our support team for assistance.
          </p>
        </div>

        {/* Disabled Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                       font-semibold opacity-50 cursor-not-allowed
                       bg-[var(--btn-primary-bg)]
                       text-[var(--btn-primary-text)]"
          >
            <Mail className="w-5 h-5" />
            Contact Support
          </button>

          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                       font-semibold opacity-50 cursor-not-allowed
                       bg-[var(--btn-secondary-bg)]
                       text-[var(--btn-secondary-text)]"
          >
            <HelpCircle className="w-5 h-5" />
            Help Center
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-sm text-[var(--text-tertiary)]">
          Reference: Contact admin@eventhost.com for appeals
        </p>
      </div>
    </div>
  );
};

export default BlockedAccountMessage;
