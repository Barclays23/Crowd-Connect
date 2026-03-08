import React, { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, LayoutGrid, LayoutList, X, Loader2, CalendarX, MapPin } from "lucide-react";
import { EVENT_CATEGORIES, type IEventState } from "@/types/event.types";
import EventCard from "@/components/event/EventCard";
import EventCardList from "@/components/event/EventCardList";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { toast } from "react-toastify";
import { eventServices } from "@/services/eventServices";


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

function EventsDiscoveryPage() {
   const [events, setEvents] = useState<IEventState[]>([]);
   const [loading, setLoading] = useState(true);
   const [layout, setLayout] = useState<"grid" | "list">("grid");
   const [showFilters, setShowFilters] = useState(false);

   // Filters
   const [search, setSearch] = useState("");
   const [category, setCategory] = useState("");
   const [format, setFormat] = useState("");
   const [ticketType, setTicketType] = useState("");
   const [sort, setSort] = useState("upcoming");

   const activeFilterCount = [category, format, ticketType].filter(Boolean).length;

   const fetchEvents = useCallback(async (searchVal = search) => {
      setLoading(true);
      try {
         const params = new URLSearchParams();
         if (searchVal) params.append("search", searchVal);
         if (category) params.append("category", category);
         if (format) params.append("format", format);
         if (ticketType) params.append("ticketType", ticketType);
         if (sort) params.append("sort", sort);

         const response = await eventServices.getPublicEvents(params.toString());
         setEvents(response.eventsData ?? []);
      } catch (error: unknown) {
         const errorMessage = getApiErrorMessage(error);
         if (errorMessage) toast.error(errorMessage);
      } finally {
         setLoading(false);
      }
   }, [category, format, ticketType, sort]);



   // Re-fetch when filters/sort change (not on every search keystroke)
   useEffect(() => {
      fetchEvents();
   }, [category, format, ticketType, sort]);


   const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchEvents(search);
   };


   const clearFilters = () => {
      setCategory("");
      setFormat("");
      setTicketType("");
      setSort("upcoming");
   };


   
   return (
      <div className="min-h-screen bg-(--bg-primary) text-(--text-primary)">

         {/* ── Hero / Search Bar ── */}
         <section className="bg-(--bg-secondary) border-b border-(--border-muted)">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-(--heading-primary) mb-3 tracking-tight">
                     Discover Events
                  </h1>
                  <p className="text-(--text-secondary) text-base sm:text-lg mb-8 max-w-xl">
                     Find the best in-person and online events happening near you.
                  </p>

                  {/* Search */}
                  <form onSubmit={handleSearch} className="flex gap-3">
                     <div className="relative flex-1">
                           <Search
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-tertiary) pointer-events-none"
                           />
                           <input
                              type="text"
                              placeholder="Search events, categories, organisers..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="w-full bg-(--form-input-bg) text-(--form-input-text) border border-(--form-border) rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--brand-primary) focus:border-(--brand-primary) transition-all placeholder:text-(--text-tertiary)"
                           />
                           {search && (
                              <button
                                 type="button"
                                 onClick={() => { setSearch(""); fetchEvents(""); }}
                                 className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
                              >
                                 <X size={16} />
                              </button>
                           )}
                     </div>
                     <button
                           type="submit"
                           className="bg-(--btn-primary-bg) hover:bg-(--btn-primary-hover) text-(--btn-primary-text) font-semibold rounded-xl px-6 py-3.5 text-sm transition-colors shrink-0"
                     >
                           Search
                     </button>
                  </form>
               </div>
         </section>

         {/* ── Toolbar ── */}
         <div className="sticky top-0 z-20 bg-(--bg-primary) border-b border-(--border-muted) shadow-sm">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">

                  {/* Left: filter toggle + active count */}
                  <div className="flex items-center gap-3">
                     <button
                           onClick={() => setShowFilters(!showFilters)}
                           className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
                              ${showFilters
                                 ? "bg-(--brand-primary) text-(--btn-primary-text) border-(--brand-primary)"
                                 : "bg-(--bg-secondary) text-(--text-primary) border-(--border-muted) hover:border-(--brand-primary)"
                              }`}
                     >
                           <SlidersHorizontal size={15} />
                           Filters
                           {activeFilterCount > 0 && (
                              <span className="bg-(--btn-primary-text) text-(--brand-primary) text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                 {activeFilterCount}
                              </span>
                           )}
                     </button>

                     {activeFilterCount > 0 && (
                           <button
                              onClick={clearFilters}
                              className="text-xs text-(--text-tertiary) hover:text-(--status-error) transition-colors flex items-center gap-1"
                           >
                              <X size={13} /> Clear all
                           </button>
                     )}
                  </div>

                  {/* Right: sort + layout toggle */}
                  <div className="flex items-center gap-3">
                     <select
                           value={sort}
                           onChange={(e) => setSort(e.target.value)}
                           className="bg-(--form-input-bg) text-(--form-input-text) border border-(--form-border) rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--brand-primary) cursor-pointer"
                     >
                           {SORT_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                           ))}
                     </select>

                     <div className="flex items-center border border-(--border-muted) rounded-lg overflow-hidden">
                           <button
                              onClick={() => setLayout("grid")}
                              className={`p-2 transition-colors ${layout === "grid" ? "bg-(--brand-primary) text-(--btn-primary-text)" : "bg-(--bg-secondary) text-(--text-tertiary) hover:text-(--text-primary)"}`}
                           >
                              <LayoutGrid size={16} />
                           </button>
                           <button
                              onClick={() => setLayout("list")}
                              className={`p-2 transition-colors ${layout === "list" ? "bg-(--brand-primary) text-(--btn-primary-text)" : "bg-(--bg-secondary) text-(--text-tertiary) hover:text-(--text-primary)"}`}
                           >
                              <LayoutList size={16} />
                           </button>
                     </div>
                  </div>
               </div>

               {/* Filter panel — slides open */}
               {showFilters && (
                  <div className="border-t border-(--border-muted) bg-(--bg-secondary)">
                     <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-4">

                           {/* Category */}
                           <div className="flex flex-col gap-1 min-w-48">
                              <label className="text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">Category</label>
                              <select
                                 value={category}
                                 onChange={(e) => setCategory(e.target.value)}
                                 className="bg-(--form-input-bg) text-(--form-input-text) border border-(--form-border) rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--brand-primary)"
                              >
                                 <option value="">All Categories</option>
                                 {EVENT_CATEGORIES.map((cat) => (
                                       <option key={cat} value={cat}>{cat}</option>
                                 ))}
                              </select>
                           </div>

                           {/* Format */}
                           <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">Format</label>
                              <div className="flex gap-2">
                                 {FORMAT_OPTIONS.map((o) => (
                                       <button
                                          key={o.value}
                                          onClick={() => setFormat(o.value)}
                                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${format === o.value
                                             ? "bg-(--brand-primary) text-(--btn-primary-text) border-(--brand-primary)"
                                             : "bg-(--form-input-bg) text-(--form-input-text) border-(--form-border) hover:border-(--brand-primary)"
                                             }`}
                                       >
                                          {o.label}
                                       </button>
                                 ))}
                              </div>
                           </div>

                           {/* Ticket type */}
                           <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-(--text-tertiary) uppercase tracking-wider">Price</label>
                              <div className="flex gap-2">
                                 {TICKET_OPTIONS.map((o) => (
                                       <button
                                          key={o.value}
                                          onClick={() => setTicketType(o.value)}
                                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${ticketType === o.value
                                             ? "bg-(--brand-primary) text-(--btn-primary-text) border-(--brand-primary)"
                                             : "bg-(--form-input-bg) text-(--form-input-text) border-(--form-border) hover:border-(--brand-primary)"
                                             }`}
                                       >
                                          {o.label}
                                       </button>
                                 ))}
                              </div>
                           </div>
                     </div>
                  </div>
               )}
         </div>

         {/* ── Active filter chips ── */}
         {(category || format || ticketType) && (
               <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 flex flex-wrap gap-2">
                  {category && (
                     <span className="flex items-center gap-1.5 px-3 py-1 bg-(--badge-info-bg) text-(--badge-info-text) border border-(--badge-info-border) rounded-full text-xs font-medium">
                           {category}
                           <button onClick={() => setCategory("")}><X size={12} /></button>
                     </span>
                  )}
                  {format && (
                     <span className="flex items-center gap-1.5 px-3 py-1 bg-(--badge-info-bg) text-(--badge-info-text) border border-(--badge-info-border) rounded-full text-xs font-medium">
                           {format === "online" ? "Online" : "In-Person"}
                           <button onClick={() => setFormat("")}><X size={12} /></button>
                     </span>
                  )}
                  {ticketType && (
                     <span className="flex items-center gap-1.5 px-3 py-1 bg-(--badge-info-bg) text-(--badge-info-text) border border-(--badge-info-border) rounded-full text-xs font-medium">
                           {ticketType === "free" ? "Free" : "Paid"}
                           <button onClick={() => setTicketType("")}><X size={12} /></button>
                     </span>
                  )}
               </div>
         )}

         {/* ── Event Grid / List ── */}
         <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

               {/* Result count */}
               {!loading && (
                  <p className="text-sm text-(--text-tertiary) mb-6">
                     {events.length === 0 ? "No events found" : `${events.length} event${events.length !== 1 ? "s" : ""} found`}
                  </p>
               )}

               {loading ? (
                  <div className="flex flex-col items-center justify-center h-72 gap-3 text-(--text-tertiary)">
                     <Loader2 size={32} className="animate-spin text-(--brand-primary)" />
                     <span className="text-sm">Loading events...</span>
                  </div>
               ) : events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                     <div className="w-20 h-20 rounded-full bg-(--bg-secondary) flex items-center justify-center border border-(--border-muted)">
                           <CalendarX size={32} className="text-(--text-tertiary)" />
                     </div>
                     <h3 className="text-xl font-bold text-(--heading-primary)">No events found</h3>
                     <p className="text-(--text-secondary) text-sm text-center max-w-xs">
                           Try adjusting your search or filters to find what you're looking for.
                     </p>
                     {activeFilterCount > 0 && (
                           <button
                              onClick={clearFilters}
                              className="mt-2 px-5 py-2.5 bg-(--brand-primary) text-(--btn-primary-text) rounded-lg text-sm font-semibold hover:bg-(--btn-primary-hover) transition-colors"
                           >
                              Clear Filters
                           </button>
                     )}
                  </div>
               ) : layout === "grid" ? (
                  // grid layout
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                     {events.map((event) => (
                           <EventCard key={event.eventId} event={event} />
                     ))}
                  </div>
               ) : (
                  // List layout
                  <div className="flex flex-col gap-4">
                     {events.map((event) => (
                           <EventCardList key={event.eventId} event={event} />
                     ))}
                  </div>
               )}
         </section>
      </div>
   );
}

export default EventsDiscoveryPage;