import { LogIn, UserPlus, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";




const AuthRequiredMessage = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12
                        bg-[var(--bg-primary)]">
            <div
                className="max-w-md w-full rounded-2xl p-8 text-center
                        bg-[var(--card-bg)]
                        border border-[var(--card-border)]
                        shadow-[var(--shadow-lg)]"
            >
                {/* Icon */}
                <div
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center
                            bg-[var(--badge-primary-bg)]"
                >
                <Calendar className="w-10 h-10 text-[var(--brand-primary)]" />
                </div>

                {/* Heading */}
                <h1 className="text-2xl font-bold mb-3 text-[var(--heading-primary)]">
                Host Your Event
                </h1>

                {/* Description */}
                <p className="mb-8 leading-relaxed text-[var(--text-secondary)]">
                Please sign in or create an account to host an event and reach thousands
                of attendees.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                <Link
                    to="/login"
                    state={{ from: location }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                            font-semibold transition-all duration-200
                            hover:scale-[1.02] active:scale-[0.98]
                            bg-[var(--btn-primary-bg)]
                            text-[var(--btn-primary-text)]
                            hover:bg-[var(--btn-primary-hover)]"
                >
                    <LogIn className="w-5 h-5" />
                    Sign In
                </Link>


                <Link
                    to="/register"
                    state={{ from: location }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                            font-semibold transition-all duration-200
                            hover:scale-[1.02] active:scale-[0.98]
                            bg-[var(--btn-secondary-bg)]
                            text-[var(--btn-secondary-text)]
                            hover:bg-[var(--btn-secondary-hover)]"
                >
                    <UserPlus className="w-5 h-5" />
                    Sign Up
                </Link>
                </div>

                {/* Footer text */}
                <p className="mt-6 text-sm text-[var(--text-tertiary)]">
                Join our community of event organizers today
                </p>
            </div>
        </div>
    );
};

export default AuthRequiredMessage;
