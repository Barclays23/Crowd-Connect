import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Upload,
  Globe,
  Building2,
  FileText,
  Tag,
  Sparkles,
  PlusCircle,
} from "lucide-react";

interface EventFormData {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  isOnline: boolean;
  location: string;
  ticketPrice: string;
  capacity: string;
  banner: File | null;
}

const categories = [
  "Music & Concerts",
  "Tech & Business",
  "Sports & Fitness",
  "Arts & Culture",
  "Food & Drink",
  "Health & Wellness",
  "Education & Workshops",
  "Networking & Social",
];

const HostEventForm = () => {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    isOnline: false,
    location: "",
    ticketPrice: "",
    capacity: "",
    banner: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleOnline = (online: boolean) => {
    setFormData((prev) => ({ ...prev, isOnline: online, location: online ? "" : prev.location }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, banner: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
  };

  const isFormValid =
    formData.title &&
    formData.description &&
    formData.category &&
    formData.date &&
    formData.time &&
    (formData.isOnline || formData.location) &&
    formData.capacity;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-primary">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-[var(--heading-primary)]">
            Create New Event
          </h1>
          <p className="max-w-md mx-auto text-[var(--text-secondary)]">
            Fill in the details below to create an amazing event for your audience.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl p-8 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--shadow-lg)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                Event Title *
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Give your event a catchy title"
                  className="w-full pl-12 pr-4 py-3 rounded-xl outline-none border border-[var(--form-input-border)] bg-[var(--form-input-bg)] text-[var(--form-input-text)] focus:border-[var(--brand-primary)] focus:ring focus:ring-[var(--form-focus-ring)] transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your event in detail..."
                className="w-full px-4 py-3 rounded-xl outline-none border border-[var(--form-input-border)] bg-[var(--form-input-bg)] text-[var(--form-input-text)] focus:border-[var(--brand-primary)] focus:ring focus:ring-[var(--form-focus-ring)] transition resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                Category *
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl outline-none border border-[var(--form-input-border)] bg-[var(--form-input-bg)] text-[var(--form-input-text)] cursor-pointer appearance-none focus:border-[var(--brand-primary)] focus:ring focus:ring-[var(--form-focus-ring)] transition"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl outline-none border border-[var(--form-input-border)] bg-[var(--form-input-bg)] text-[var(--form-input-text)] focus:border-[var(--brand-primary)] focus:ring focus:ring-[var(--form-focus-ring)] transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Time *</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl outline-none border border-[var(--form-input-border)] bg-[var(--form-input-bg)] text-[var(--form-input-text)] focus:border-[var(--brand-primary)] focus:ring focus:ring-[var(--form-focus-ring)] transition"
                  />
                </div>
              </div>
            </div>

            {/* Event Type Toggle */}
            <div>
              <label className="block text-sm font-medium mb-3 text-[var(--text-primary)]">Event Type *</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleOnline(false)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition ${
                    !formData.isOnline
                      ? "bg-[var(--badge-primary-bg)] border-2 border-[var(--brand-primary)] text-[var(--brand-primary)]"
                      : "bg-[var(--bg-secondary)] border-2 border-transparent text-[var(--text-secondary)]"
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  In-Person
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleOnline(true)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition ${
                    formData.isOnline
                      ? "bg-[var(--badge-primary-bg)] border-2 border-[var(--brand-primary)] text-[var(--brand-primary)]"
                      : "bg-[var(--bg-secondary)] border-2 border-transparent text-[var(--text-secondary)]"
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  Online
                </button>
              </div>
            </div>

            {/* Location (if in-person) */}
            {!formData.isOnline && (
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter venue address"
                    className="w-full pl-12 pr-4 py-3 rounded-xl outline-none border border-[var(--form-input-border)] bg-[var(--form-input-bg)] text-[var(--form-input-text)] focus:border-[var(--brand-primary)] focus:ring focus:ring-[var(--form-focus-ring)] transition"
                  />
                </div>
              </div>
            )}

            {/* Price & Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Ticket Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                    type="number"
                    name="ticketPrice"
                    value={formData.ticketPrice}
                    onChange={handleInputChange}
                    placeholder="0.00 (Free)"
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 rounded-xl outline-none border border-[var(--form-input-border)] bg-[var(--form-input-bg)] text-[var(--form-input-text)] focus:border-[var(--brand-primary)] focus:ring focus:ring-[var(--form-focus-ring)] transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Capacity *</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Max attendees"
                    min="1"
                    className="w-full pl-12 pr-4 py-3 rounded-xl outline-none border border-[var(--form-input-border)] bg-[var(--form-input-bg)] text-[var(--form-input-text)] focus:border-[var(--brand-primary)] focus:ring focus:ring-[var(--form-focus-ring)] transition"
                  />
                </div>
              </div>
            </div>

            {/* Banner Upload */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">Event Banner</label>
              <div className="relative rounded-xl p-8 text-center cursor-pointer transition hover:opacity-80 bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border-muted)]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-10 h-10 mx-auto mb-3 text-[var(--text-tertiary)]" />
                {formData.banner ? (
                  <p className="text-[var(--text-primary)]">{formData.banner.name}</p>
                ) : (
                  <>
                    <p className="text-[var(--text-secondary)]">Drop your event banner here or click to upload</p>
                    <p className="text-sm mt-1 text-[var(--text-tertiary)]">Recommended: 1920x1080px, JPG or PNG</p>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 bg-gradient-primary text-[var(--btn-primary-text)]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  Creating Event...
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Create Event
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-[var(--text-tertiary)]">
          Your event will be reviewed before going live
        </p>
      </div>
    </div>
  );
};

export default HostEventForm;
