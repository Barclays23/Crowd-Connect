import { ShieldCheck, ArrowRight, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";



const AdminHostingMessage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-primary) px-4 py-12">
      <div
        className="
          max-w-md w-full rounded-2xl p-8 text-center
          bg-(--card-bg)
          border border-(--card-border)
          shadow-(--shadow-lg)
        "
      >
        {/* Icon */}
        <div
          className="
            w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center
            bg-(--badge-info-bg)
          "
        >
          <ShieldCheck className="w-10 h-10 text-(--brand-primary)" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold mb-3 text-(--heading-primary)">
          Admin Account
        </h1>

        {/* Description */}
        <p className="mb-6 leading-relaxed text-(--text-secondary)">
          As an admin, you manage the platform and cannot host events directly.
          Use the admin dashboard to review and manage host applications.
        </p>

        {/* Info box */}
        <div
          className="
            rounded-xl p-4 mb-6
            bg-(--badge-info-bg)
            border border-(--badge-info-border)
          "
        >
          <p className="text-sm text-(--badge-info-text)">
            Admins can approve host applications, manage events, and oversee
            platform operations from the dashboard.
          </p>
        </div>

        {/* Link Button */}
        <Link
          to="/admin"
          className="
            w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
            font-semibold transition-all duration-200
            bg-(--btn-primary-bg)
            text-(--btn-primary-text)
            hover:bg-(--btn-primary-hover)
            hover:scale-[1.02] active:scale-[0.98]
          "
        >
          <LayoutDashboard className="w-5 h-5" />
          Go to Admin Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Footer */}
        <p className="mt-6 text-sm text-(--text-tertiary)">
          Manage hosts, events, and users from one place
        </p>
      </div>
    </div>
  );
};

export default AdminHostingMessage;
