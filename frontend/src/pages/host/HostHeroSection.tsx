// frontend/src/pages/host/HostHeroSection.tsx
import { Calendar, Users, Ticket, ArrowRight, Sparkles } from "lucide-react";

interface Props {
  onHostClick: () => void;
}

const HostHeroSection = ({ onHostClick }: Props) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8
                          bg-[var(--badge-primary-bg)]
                          border border-[var(--badge-primary-border)]">
            <Sparkles className="w-4 h-4 text-[var(--brand-primary)]" />
            <span className="text-sm font-medium text-[var(--badge-primary-text)]">
              Event Hosting Platform
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight
                         text-[var(--heading-primary)]">
            Create Unforgettable
            <br />
            <span className="text-[var(--brand-primary)]">Events</span> That Matter
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10
                        text-[var(--text-secondary)]">
            Host, manage, and sell tickets to your events with our powerful
            platform. Reach thousands of attendees and create memorable
            experiences.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onHostClick}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold
                         bg-gradient-primary hover:scale-[1.02] cursor-pointer
                         text-[var(--btn-primary-text)]"
            >
              <Calendar className="w-5 h-5" />
              Host an Event
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold
                         transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                         cursor-pointer
                         bg-[var(--btn-secondary-bg)]
                         text-[var(--btn-secondary-text)]"
            >
              <Ticket className="w-5 h-5" />
              Browse Events
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { icon: Calendar, value: "10K+", label: "Events Hosted" },
              { icon: Users, value: "500K+", label: "Attendees" },
              { icon: Ticket, value: "1M+", label: "Tickets Sold" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-xl
                           bg-[var(--card-bg)]
                           border border-[var(--card-border)]
                           shadow-[var(--shadow-sm)]"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-[var(--brand-primary)]" />
                <p className="text-2xl font-bold text-[var(--heading-primary)]">
                  {stat.value}
                </p>
                <p className="text-sm text-[var(--text-tertiary)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
};

export default HostHeroSection;
