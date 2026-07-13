import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  MapPin,
  CalendarDays,
  SlidersHorizontal,
  LayoutGrid,
  LayoutList,
  X,
  Loader2,
  CalendarX,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DEFAULT_RADIUS_KM,
  type GetPublicEventsParams,
  type IEventState, 
  type PublicEventsSortOption
} from "@/types/event.types";
import EventCard1 from "@/components/event/EventCard1";
import EventCardList from "@/components/event/EventCardList";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { toast } from "react-toastify";
import { eventServices } from "@/services/eventServices";
import { UserPagination } from "@/components/user/UserPagination";
import { GooglePlacesAutoComplete, type SelectedLocation } from "@/components/common/GooglePlacesAutoComplete";
import { PillToggle } from "@/components/ui/PillToggle";

import heroBg_Day from "@/assets/images/hero-images/event-hero-bg1-day.png"
import heroBg_Night from "@/assets/images/hero-images/event-hero-bg1-night.png"

import { useTheme } from "@/contexts/ThemeContext";
import { EVENT_CATEGORIES, EVENT_FORMATS } from "@/constants/event.constants";
import type { ApiResponse } from "@/types/common.types";


const FORMAT_OPTIONS = [
  { value: "", label: "Any Format" },
  { value: "offline", label: "In-Person" },
  { value: "online", label: "Online / Virtual" },
];

const SORT_OPTIONS = [
  { value: "upcoming", label: "Upcoming First" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const TICKET_OPTIONS = [
  { value: "", label: "Any Price" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];


// ─── Sub-components ───────────────────────────────────────────────────────────

/** Pill-style active filter chip */
function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-(--badge-info-bg) text-(--badge-info-text) border border-(--badge-info-border) transition-all">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:opacity-70 transition-opacity"
        aria-label={`Remove ${label} filter`}
      >
        <X size={11} strokeWidth={2.5} />
      </button>
    </span>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────

function EventsDiscoveryPage() {
  const { theme } = useTheme();
  const heroBg = theme === "dark" ? heroBg_Night : heroBg_Day;

  const eventsSectionRef = useRef<HTMLElement>(null);

  const [events, setEvents] = useState<IEventState[]>([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [category, setCategory] = useState("");
  const [format, setFormat] = useState("");
  const [ticketType, setTicketType] = useState("");
  const [sort, setSort] = useState("upcoming");

  // Pagination
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);


  const todayStr = new Date().toLocaleDateString('en-CA');

  const activeFilterCount = [
    category,
    format,
    ticketType,
    search,
    selectedLocation,
    startDate,
    endDate,
  ].filter(Boolean).length;


  const fetchEvents = useCallback(
    async (page = 1, overrideSearch = search) => {
      setLoading(true);

      try {
        // const params = new URLSearchParams();
        // if (overrideSearch) params.append("search", overrideSearch);
        // if (category) params.append("category", category);
        // if (format) params.append("format", format);
        // if (ticketType) params.append("ticketType", ticketType);
        // if (sort) params.append("sort", sort);
        // if (startDate) params.append("startDate", startDate);
        // if (endDate) params.append("endDate", endDate);
        // if (selectedLocation) {
        //   params.append("lat", selectedLocation.lat.toString());
        //   params.append("lng", selectedLocation.lng.toString());
        //   params.append("locationName", selectedLocation.name);
        // }
        // params.append("limit", itemsPerPage.toString());
        // params.append("page", page.toString());

        const params: GetPublicEventsParams = {
          page,
          limit: itemsPerPage,
          ...(overrideSearch && { search: overrideSearch }),
          ...(category && { category }),
          ...(format && { format }),
          ...(ticketType && { ticketType }),
          ...(sort && { sortBy: sort as PublicEventsSortOption }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          ...(selectedLocation && {
            lat       : selectedLocation.lat,
            lng       : selectedLocation.lng,
            radiusKm  : DEFAULT_RADIUS_KM, 
          }),
        };

        const response: ApiResponse<IEventState[]> = await eventServices.getPublicEvents(params);

        setEvents(response.data ?? []);
        setTotalEvents(response.pagination?.totalCount ?? 0);
        setTotalPages(response.pagination?.totalPages ?? 0);

      } catch (error: unknown) {
        const errorMessage = getApiErrorMessage(error);
        if (errorMessage) toast.error(errorMessage);
        
      } finally {
        setLoading(false);
      }
    },
    [category, format, ticketType, sort, search, startDate, endDate, selectedLocation]
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, format, ticketType, sort, startDate, endDate, selectedLocation]);



  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents(1, search);
  };

  const clearFilters = () => {
    setCategory("");
    setFormat("");
    setTicketType("");
    setSort("upcoming");
    setSearch("");
    setSelectedLocation(null);
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    fetchEvents(1, "");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEvents(page, search);
    if (eventsSectionRef.current) {
      const yOffset = -125;
      const y = eventsSectionRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };



  return (
    <div className="min-h-screen bg-(--bg-primary) text-(--text-primary)">

      {/* ════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden border-b border-(--border-muted)"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Gradient overlay — existing colour variables with transparency */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 opacity-50"
          style={{
            background:
              "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)",
          }}
        />

        {/* Decorative radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden z-1"
        >
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-175 h-175 rounded-full bg-(--brand-primary) opacity-[0.16] blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">

          {/* Eyebrow badge */}
          <span className="inline-flex items-center gap-1.5 mb-5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-(--badge-info-bg) text-(--badge-info-text) border border-(--badge-info-border)">
            <Sparkles size={12} className="text-(--brand-primary)" />
            Find your next experience
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-(--heading-primary) mb-4 leading-[1.1]">
            Discover &amp; Host
            <span className="block text-(--brand-primary)">Events Near You</span>
          </h1>
          <p className="text-base sm:text-xl text-(--text-secondary) mb-10 max-w-2xl mx-auto">
            Find amazing in-person and online events, or create your own
            unforgettable experiences for the world to see.
          </p>

         {/* ── Search Card ── */}
         <form
          onSubmit={handleHeroSearch}
          className="bg-(--card-bg)/50 border border-(--card-border) rounded-2xl shadow-xl my-2 p-4 sm:p-4 text-left"
         >
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-3 lg:gap-0">

            {/* Keyword search */}
            <div className="flex-1 min-w-0 lg:px-3 lg:py-1">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary) mb-1.5 ml-1">
              What
              </label>
              <div className="relative">
              <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-tertiary) pointer-events-none"
              />
              <Input
                  type="text"
                  placeholder="Event name, keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-8 bg-(--form-input-bg) text-(--form-input-text) border-(--form-input-border) placeholder:text-(--form-placeholder)"
              />
              {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
                  >
                    <X size={13} />
                  </button>
              )}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px bg-(--border-muted) self-stretch my-1" />

            {/* Location search */}
            <div className="flex-1 min-w-0 lg:px-3 lg:py-1">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary) mb-1.5 ml-1">
                  Where
              </label>
              <div className="relative">
                  <MapPin
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-tertiary) pointer-events-none z-10"
                  />
                  <GooglePlacesAutoComplete
                    placeholder="City, venue or address..."
                    defaultValue={selectedLocation?.name ?? ""}
                    onPlaceSelected={(place) => setSelectedLocation(place)}
                    className="w-full"
                  />
                  {selectedLocation && (
                    <button
                        type="button"
                        onClick={() => setSelectedLocation(null)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-tertiary) hover:text-(--text-primary) transition-colors z-10"
                    >
                        <X size={13} />
                    </button>
                  )}
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px bg-(--border-muted) self-stretch my-1" />

            {/* Date range */}
            <div className="flex-[1.4] min-w-0 lg:px-3 lg:py-1">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary) mb-1.5 ml-1">
              When
              </label>
              <div className="flex gap-1.5">
              <div className="relative flex-1">
                  <CalendarDays
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-tertiary) pointer-events-none"
                  />
                  <Input
                    type="date"
                    value={startDate}
                    min={todayStr}
                    onChange={(e) => setStartDate(e.target.value)}
                    title="Start date"
                    className="pl-8 bg-(--form-input-bg) text-(--form-input-text) border-(--form-input-border) text-sm"
                  />
              </div>
              <div className="relative flex-1">
                  <Input
                    type="date"
                    value={endDate}
                    min={startDate || todayStr}
                    onChange={(e) => setEndDate(e.target.value)}
                    title="End date"
                    className="bg-(--form-input-bg) text-(--form-input-text) border-(--form-input-border) text-sm"
                  />
              </div>
              </div>
            </div>

            {/* Search button */}
            <div className="lg:pl-3 lg:py-1 flex items-end shrink-0">
              <Button
              type="submit"
              className="w-full lg:w-auto h-10 px-6 bg-(--btn-primary-bg) hover:bg-(--btn-primary-hover) text-(--btn-primary-text) font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
              <Search size={15} className="mr-2" />
              Search Events
              </Button>
            </div>

          </div>
         </form>

        </div>
      </section>

      {/* ════════════════════════════════════════
          TOOLBAR  (sort + layout + advanced filters)
      ════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 bg-(--bg-primary)/90 backdrop-blur-md border-b border-(--border-muted) shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">

          {/* Left: advanced filter toggle + clear */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                showAdvancedFilters
                  ? "bg-(--brand-primary) text-(--btn-primary-text) border-(--brand-primary)"
                  : "bg-(--bg-secondary) text-(--text-primary) border-(--border-muted) hover:border-(--brand-primary)"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-0.5 bg-white/20 text-current text-[10px] font-bold rounded-full min-w-4.5 h-4.5 flex items-center justify-center px-1">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${showAdvancedFilters ? "rotate-180" : ""}`}
              />
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-(--text-tertiary) hover:text-(--status-error) transition-colors flex items-center gap-1"
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>

          {/* Right: sort + layout */}
          <div className="flex items-center gap-3">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-9 w-44 bg-(--form-input-bg) text-(--form-input-text) border-(--form-border) text-sm focus:ring-(--brand-primary)">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-(--card-bg) border-(--card-border) text-(--text-primary)">
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Layout toggle */}
            <div className="flex items-center border border-(--border-muted) rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setLayout("grid")}
                aria-label="Grid view"
                className={`p-2 transition-colors ${
                  layout === "grid"
                    ? "bg-(--brand-primary) text-(--btn-primary-text)"
                    : "bg-(--bg-secondary) text-(--text-tertiary) hover:text-(--text-primary)"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setLayout("list")}
                aria-label="List view"
                className={`p-2 transition-colors ${
                  layout === "list"
                    ? "bg-(--brand-primary) text-(--btn-primary-text)"
                    : "bg-(--bg-secondary) text-(--text-tertiary) hover:text-(--text-primary)"
                }`}
              >
                <LayoutList size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Advanced filter panel ── */}
        {showAdvancedFilters && (
          <div className="border-t border-(--border-muted) bg-(--bg-secondary) animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-6 items-start">

              {/* Category */}
              <div className="flex flex-col gap-1.5 min-w-48">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                  Category
                </label>
                <Select
                  value={category || "all"}
                  onValueChange={(v) => setCategory(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="bg-(--form-input-bg) text-(--form-input-text) border-(--form-border) h-9 focus:ring-(--brand-primary)">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-(--card-bg) border-(--card-border) text-(--text-primary)">
                    <SelectItem value="all">All Categories</SelectItem>
                    {EVENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Divider */}
              <div className="hidden lg:block w-px bg-(--border-muted) self-stretch my-1" />

              {/* Format */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                  Format
                </label>
                <PillToggle
                  options={FORMAT_OPTIONS}
                  value={format}
                  onChange={setFormat}
                />
              </div>

              {/* Divider */}
              <div className="hidden lg:block w-px bg-(--border-muted) self-stretch my-1" />

              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
                  Price
                </label>
                <PillToggle
                  options={TICKET_OPTIONS}
                  value={ticketType}
                  onChange={setTicketType}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          ACTIVE FILTER CHIPS
      ════════════════════════════════════════ */}
      {(category || format || ticketType || selectedLocation || startDate || endDate) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 flex flex-wrap gap-2">
          {category && (
            <FilterChip label={category} onRemove={() => setCategory("")} />
          )}
          {format && (
            <FilterChip
              label={format === EVENT_FORMATS.ONLINE ? "Online" : "In-Person"}
              onRemove={() => setFormat("")}
            />
          )}
          {ticketType && (
            <FilterChip
              label={ticketType === "free" ? "Free" : "Paid"}
              onRemove={() => setTicketType("")}
            />
          )}
          {selectedLocation && (
            <FilterChip
              label={`📍 ${selectedLocation.name}`}
              onRemove={() => setSelectedLocation(null)}
            />
          )}
          {startDate && (
            <FilterChip
              label={`From ${new Date(startDate).toLocaleDateString()}`}
              onRemove={() => setStartDate("")}
            />
          )}
          {endDate && (
            <FilterChip
              label={`Until ${new Date(endDate).toLocaleDateString()}`}
              onRemove={() => setEndDate("")}
            />
          )}
        </div>
      )}

      {/* ════════════════════════════════════════
          EVENT GRID / LIST
      ════════════════════════════════════════ */}
      <section ref={eventsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-20">

        {/* Result count */}
        {!loading && events.length > 0 && (
          <p className="text-sm text-(--text-tertiary) mb-6">
            Showing {" "}
            <span className="font-semibold text-(--text-primary)">
              {(currentPage - 1) * itemsPerPage + 1} {" – "}
              {Math.min(currentPage * itemsPerPage, totalEvents)}
            </span> {" "}
            of {" "}
            <span className="font-semibold text-(--text-primary)">{totalEvents}</span>{" "}
            event{totalEvents !== 1 ? "s" : ""}
          </p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-72 gap-3 text-(--text-tertiary)">
            <Loader2 size={32} className="animate-spin text-(--brand-primary)" />
            <span className="text-sm">Loading events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-20 h-20 rounded-full bg-(--bg-secondary) flex items-center justify-center border border-(--border-muted)">
              <CalendarX size={32} className="text-(--text-tertiary)" />
            </div>
            <h3 className="text-xl font-bold text-(--heading-primary)">No events found</h3>
            <p className="text-(--text-secondary) text-sm text-center max-w-xs">
              Try adjusting your search, location, or filters to find what
              you're looking for.
            </p>
            {activeFilterCount > 0 && (
              <Button
                onClick={clearFilters}
                className="mt-2 bg-(--brand-primary) text-(--btn-primary-text) hover:bg-(--btn-primary-hover)"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : layout === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {events.map((event) => (
              <EventCard1 key={event.eventId} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map((event) => (
              <EventCardList key={event.eventId} event={event} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col items-center gap-6 mt-10">
          <UserPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />

          {!loading && events.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                if (eventsSectionRef.current) {
                  const yOffset = -330; 
                  const y = eventsSectionRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
                  window.scrollTo({ top: y, behavior: "smooth" });
                }
              }}
              className="text-xs flex items-center gap-2"
            >
              <ChevronDown className="h-4 w-4 rotate-180" />
              Browse Events
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

export default EventsDiscoveryPage;