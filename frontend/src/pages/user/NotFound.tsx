import { Link } from 'react-router-dom'; // Adjust if using Next.js or another router



export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-[120px] font-bold text-[var(--brand-primary)] leading-none">
              4
              <span className="inline-block animate-bounce mx-2">0</span>
              4
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-32 bg-[var(--brand-primary-light)] opacity-20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--heading-primary)] mb-3">
          Oops! Event Not Found
        </h1>
        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          The event you're looking for might have ended, been removed, or the link is incorrect.
          Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--btn-primary-bg)] hover:bg-[var(--btn-primary-hover)] text-[var(--btn-primary-text)] font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </Link>

          <Link
            to="/events"
            className="inline-flex items-center justify-center px-6 py-3 bg-[var(--btn-secondary-bg)] hover:bg-[var(--btn-secondary-hover)] text-[var(--btn-secondary-text)] font-medium rounded-lg transition-all duration-200 border border-[var(--border-default)]"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Browse Events
          </Link>
        </div>

        {/* Optional: Fun Footer Note */}
        <p className="mt-10 text-sm text-[var(--text-tertiary)]">
          If you think this is a mistake, contact us at{' '}
          <a
            href="mailto:support@youreventsapp.com"
            className="text-[var(--brand-primary)] hover:underline"
          >
            support@youreventsapp.com
          </a>
        </p>
      </div>
    </div>
  );
}