import React from "react";
import { Clock, CheckCircle, FileSearch, Shield } from "lucide-react";




const HostPendingState = () => {
  const steps = [
    { icon: FileSearch, label: "Application Submitted", completed: true },
    { icon: Shield, label: "Under Review", completed: false, active: true },
    { icon: CheckCircle, label: "Approval", completed: false },
  ];


  
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg-primary) px-4 py-12">
      <div className="max-w-lg w-full rounded-2xl p-8 text-center bg-(--card-bg) border border-(--card-border) shadow-(--shadow-lg)">
        
        {/* Animated Waiting Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full animate-pulse-slow bg-(--badge-warning-bg)"></div>
          <div className="absolute inset-2 rounded-full flex items-center justify-center bg-(--card-bg)">
            <Clock className="w-10 h-10 animate-spin-slow text-(--badge-warning-text)" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold mb-3 text-(--heading-primary)">
          Application Under Review
        </h1>

        {/* Description */}
        <p className="mb-8 leading-relaxed text-(--text-secondary)">
          Your request to become a host is currently being reviewed by our team. We'll notify you once a decision is made.
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${
                      step.completed
                        ? "bg-(--badge-success-bg)"
                        : step.active
                        ? "bg-(--badge-warning-bg) border-2 border-(--badge-warning-border)"
                        : "bg-(--bg-secondary)"
                    }`}
                >
                  <step.icon
                    className={`w-5 h-5 ${
                      step.completed
                        ? "text-(--badge-success-text)"
                        : step.active
                        ? "text-(--badge-warning-text)"
                        : "text-(--text-tertiary)"
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-medium max-w-20 text-center ${
                    step.completed || step.active
                      ? "text-(--text-primary)"
                      : "text-(--text-tertiary)"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 -mt-8 ${
                    step.completed
                      ? "bg-(--badge-success-border)"
                      : "bg-(--border-muted)"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Info Box */}
        <div className="rounded-xl p-4 mb-6 bg-(--badge-info-bg) border border-(--badge-info-border)">
          <p className="text-sm text-(--badge-info-text)">
            ⏳ Estimated review time: 2-3 business days
          </p>
        </div>

        {/* Disabled Button */}
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold opacity-50 cursor-not-allowed bg-(--btn-primary-bg) text-(--btn-primary-text)"
        >
          <Clock className="w-5 h-5" />
          Event Hosting Unavailable
        </button>

        {/* Footer Text */}
        <p className="mt-6 text-sm text-(--text-tertiary)">
          You'll receive an email once your application is processed
        </p>
      </div>
    </div>
  );
};

export default HostPendingState;
