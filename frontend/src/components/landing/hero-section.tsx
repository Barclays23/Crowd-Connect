import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Calendar, Filter } from "lucide-react"



export function HeroSection() {
  return (
    <section className="relative py-24 bg-linear-to-br from-(--bg-primary) to-(--bg-secondary)">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-(--heading-primary)">
            Discover and Host
            <span className="text-(--brand-primary) block">Events Near You</span>
          </h1>
          <p className="text-xl text-(--text-secondary) mb-8 max-w-2xl mx-auto">
            Find amazing events happening around you or create your own memorable experiences
          </p>

          {/* Search Bar */}
          <div className="bg-(--card-bg) border border-(--card-border) p-4 rounded-2xl shadow-lg max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-(--text-tertiary)" />
                <Input
                  placeholder="Location"
                  className="pl-10 placeholder:text-(--form-placeholder)"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-(--text-tertiary)" />
                <Select>
                  <SelectTrigger className="pl-10 bg-(--form-input-bg) text-(--form-input-text) border-(--form-input-border)">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-(--card-bg) border-(--card-border) text-(--text-primary)">
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="food">Food & Drink</SelectItem>
                    <SelectItem value="workshop">Workshops</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-(--text-tertiary)" />
                <Input
                  type="date"
                  className="pl-10"
                />
              </div>
              <Button variant="default" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search Events
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}