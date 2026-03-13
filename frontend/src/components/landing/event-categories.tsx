import { 
  Music, Laugh, Drama, Film, Gamepad2, 
  GraduationCap, Users, Laptop, Globe, BookOpen,
  UtensilsCrossed, Shirt, Palette, Coffee, Heart,
  Trophy, Dumbbell, Circle, Zap,
  Home, Church, DollarSign, Building,
  Calendar, Award, Code, Rocket
} from "lucide-react"


const eventCategories = [
  {
    category: "Entertainment & Fun",
    events: [
      { icon: Music, label: "Music Concerts", color: "text-red-500" },
      { icon: Laugh, label: "Comedy Shows", color: "text-yellow-500" },
      { icon: Drama, label: "Theatre & Drama", color: "text-purple-500" },
      { icon: Film, label: "Movie Screenings", color: "text-blue-500" },
      { icon: Gamepad2, label: "Gaming Tournaments", color: "text-green-500" }
    ]
  },
  {
    category: "Education & Knowledge", 
    events: [
      { icon: GraduationCap, label: "Workshops", color: "text-indigo-500" },
      { icon: Users, label: "Seminars", color: "text-pink-500" },
      { icon: Laptop, label: "Tech Conferences", color: "text-cyan-500" },
      { icon: Globe, label: "Webinars", color: "text-teal-500" },
      { icon: BookOpen, label: "Book Launches", color: "text-amber-500" }
    ]
  },
  {
    category: "Lifestyle & Social",
    events: [
      { icon: UtensilsCrossed, label: "Food Festivals", color: "text-orange-500" },
      { icon: Shirt, label: "Fashion Shows", color: "text-rose-500" },
      { icon: Palette, label: "Art Exhibitions", color: "text-violet-500" },
      { icon: Coffee, label: "Cultural Events", color: "text-brown-500" },
      { icon: Heart, label: "Meetups / Networking", color: "text-red-400" }
    ]
  },
  {
    category: "Sports & Fitness",
    events: [
      { icon: Trophy, label: "Marathons", color: "text-yellow-600" },
      { icon: Dumbbell, label: "Zumba/Yoga Sessions", color: "text-green-600" },
      { icon: Circle, label: "Cricket/Football Matches", color: "text-blue-600" },
      { icon: Zap, label: "Esports Competitions", color: "text-purple-600" }
    ]
  },
  {
    category: "Family & Community",
    events: [
      { icon: Home, label: "Fairs", color: "text-emerald-500" },
      { icon: Users, label: "Community Gatherings", color: "text-sky-500" },
      { icon: Church, label: "Religious/Spiritual Events", color: "text-slate-500" },
      { icon: DollarSign, label: "Charity Fundraisers", color: "text-lime-500" }
    ]
  },
  {
    category: "Corporate",
    events: [
      { icon: Rocket, label: "Product Launches", color: "text-red-600" },
      { icon: Building, label: "Company Annual Days", color: "text-blue-700" },
      { icon: Award, label: "Training Programs", color: "text-green-700" },
      { icon: Code, label: "Hackathons", color: "text-purple-700" }
    ]
  }
]



export function EventCategories() {
  return (
    <section className="py-16 bg-(--bg-accent)/90">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-(--heading-primary) mb-2">Event Categories & Types</h2>
          <p className="text-(--text-secondary)">Explore our diverse range of events across multiple categories</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventCategories.map((category, index) => (
            <div key={index}
              className="bg-(--card-bg) border border-(--card-border) rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <h3 className="text-lg font-semibold text-(--heading-secondary) mb-4 border-b border-(--border-default) pb-2">
                {category.category}
              </h3>
              <div className="space-y-3">
                {category.events.map((event, eventIndex) => {
                  const IconComponent = event.icon
                  return (
                    <div
                      key={eventIndex}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-(--bg-accent) cursor-pointer group transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-(--card-secondary) flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComponent className={`h-4 w-4 ${event.color}`} />
                      </div>
                      <span className="text-sm text-(--text-primary) group-hover:text-(--brand-primary) transition-colors">
                        {event.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}