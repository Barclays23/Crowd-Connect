import { Button } from "@/components/ui/button"
import { Calendar, Users, MapPin, Star, ArrowRight } from "lucide-react"

const stats = [
  {
    icon: Calendar,
    number: "600+",
    label: "Events Conducted",
    description: "Successfully organized events"
  },
  {
    icon: Users, 
    number: "150K+",
    label: "People Participated",
    description: "Active community members"
  },
  {
    icon: MapPin,
    number: "150+",
    label: "Locations",
    description: "Cities and venues covered"
  },
  {
    icon: Star,
    number: "22+",
    label: "Event Types",
    description: "Different categories available"
  }
]

export function PlatformStats() {
  return (
    <section className="py-16 bg-(--bg-tertiary)/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-(--heading-primary) mb-2">Our Platform Impact</h2>
          <p className="text-(--text-secondary)">Join thousands of event organizers and attendees in our growing community</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-(--bg-tertiary) rounded-2xl flex items-center justify-center group-hover:bg-(--bg-accent) transition-colors">
                  <IconComponent className="h-8 w-8 text-(--brand-primary)" />
                </div>
                <div className="text-3xl font-bold text-(--heading-primary) mb-2">{stat.number}</div>
                <div className="text-lg font-medium text-(--text-primary) mb-1">{stat.label}</div>
                <div className="text-sm text-(--text-tertiary)">{stat.description}</div>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <div className="max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold text-(--heading-primary) mb-4">Ready to Host Your Event?</h3>
            <p className="text-(--text-secondary) mb-6">
              Join our platform and reach thousands of potential attendees. Whether it's a small workshop or a large conference,
              we provide all the tools you need to make your event successful.
            </p>
          </div>
          <Button size="lg"
            className="gap-2 group bg-(--btn-primary-bg) hover:bg-(--btn-primary-hover) text-(--btn-primary-text)">
            Get Started - Host an Event
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}