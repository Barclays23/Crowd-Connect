// frontend/src/pages/host/OrganiserDetailsPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicOrganizerProfile from "@/components/host/PublicOrganizerProfile";
import OrganiserEventsSection from "@/components/host/OrganiserEventsSection";
import ReviewsSection from "@/components/review/ReviewsSection";





export default function OrganiserDetailsPage() {
    const { hostId } = useParams<{ hostId: string }>();
    const navigate = useNavigate();

    if (!hostId) return null;

    return (
        <div className="min-h-screen bg-(--bg-primary) text-(--text-primary)">
            <div className="max-w-6xl mx-auto px-4 pt-6 pb-6">
                <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="gap-1.5 -ml-3">
                    <ChevronLeft size={18} /> Back
                </Button>
            </div>

            <div className="max-w-6xl mx-auto px-4">
                <PublicOrganizerProfile hostId={hostId} />
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">
                    <div>
                        <OrganiserEventsSection hostId={hostId} />
                    </div>
                    <div>
                        <ReviewsSection hostId={hostId} />
                    </div>
                </div>
            </div>
        </div>
    );
}