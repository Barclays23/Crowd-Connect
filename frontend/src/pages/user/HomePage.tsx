import { HeroSection } from "@/components/landing/hero-section";
import { EventCategories } from "@/components/landing/event-categories";
import { FeaturedEvents } from "@/components/landing/featured-events";
import { PlatformStats } from "@/components/landing/platform-stats";
import { TrendingEvents } from "@/components/landing/trending-events";
import { EventsNearYou } from "@/components/landing/events-near-you";



const HomePage = () => {
  return (
    <div className="min-h-screen bg-(--bg-primary)">
      <main>
        <HeroSection />
        <FeaturedEvents />
        <EventsNearYou />
        <EventCategories />
        <TrendingEvents />
        <PlatformStats />
      </main>
    </div>
  );
};

export default HomePage;