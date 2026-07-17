// frontend/src/pages/host/OrganiserDetailsPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrganizerProfile from "@/components/host/OrganizerProfile";
import OrganiserEventsSection from "@/components/host/OrganiserEventsSection";






export default function OrganiserDetailsPage() {
    const { hostId } = useParams<{ hostId: string }>();
    const navigate = useNavigate();

    if (!hostId) return null;

    return (
        <div className="min-h-screen bg-(--bg-primary) text-(--text-primary)">
            {/* Nav */}
            <div className="max-w-6xl mx-auto px-4 pt-6 pb-6">
                <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="gap-1.5 -ml-3">
                    <ChevronLeft size={18} /> Back
                </Button>
            </div>

            {/* Profile Component (Fetches its own data) */}
            <div className="max-w-6xl mx-auto px-4">
                <OrganizerProfile hostId={hostId} />
            </div>

            {/* Events Grid Component (Fetches its own data) */}
            <div className="max-w-6xl mx-auto px-4 pb-20">
                <OrganiserEventsSection hostId={hostId} />
            </div>
        </div>
    );
}