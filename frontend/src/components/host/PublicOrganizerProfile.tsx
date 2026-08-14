import { useEffect, useState } from "react";
import { Star, MapPin, Mail, Building, Phone, CheckCircle2 } from "lucide-react";
import { LoadingSpinner1 } from "@/components/shared/LoadingSpinner1";
import { hostServices } from "@/services/hostServices"; 
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { OrganiserProfileData } from "@/types/user.types";
import type { ApiResponse } from "@/types/common.types";
import { StarRating } from "@/components/shared/StarRating";



interface OrganizerProfileProps {
    hostId: string;
}



export default function PublicOrganizerProfile({ hostId }: OrganizerProfileProps) {
    const [host, setHost] = useState<OrganiserProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response: ApiResponse<OrganiserProfileData> = await hostServices.getOrganiserProfile(hostId);
                setHost(response.data);

            } catch (error: unknown) {
                const errorMessage = getApiErrorMessage(error);
                if (errorMessage) toast.error(errorMessage);

            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [hostId]);

    if (loading) return <div className="h-40 flex items-center justify-center"><LoadingSpinner1 size="md" message="Loading profile..." /></div>;
    if (!host) return <div className="text-center p-10 text-(--text-secondary)">Profile not found.</div>;

    return (
        <div className="bg-(--card-bg) border border-(--card-border) rounded-4xl p-6 sm:p-10 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-sm relative overflow-hidden mb-12">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-(--brand-primary) opacity-5 rounded-full blur-3xl" />

            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-(--bg-secondary) border-[6px] border-(--bg-primary) shadow-xl flex items-center justify-center overflow-hidden shrink-0 z-10">
                {host.organizationLogo ? (
                    <img src={host.organizationLogo} alt="Host" className="w-full h-full object-cover" />
                ) : (
                    <Building size={48} className="text-(--text-tertiary)" />
                )}
            </div>
            
            <div className="flex-1 text-center md:text-left z-10">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h1 className="text-3xl font-extrabold text-(--heading-primary)">
                        {host.organizationName}
                    </h1>
                    <CheckCircle2 size={20} className="text-(--status-success)" />
                </div>

                {/* Description */}
                <p className="text-(--text-secondary) mb-6 max-w-lg leading-relaxed whitespace-pre-line">
                    {host.organizationDescription || "An official event organiser on CrowdConnect, hosting verified and trusted experiences."}
                </p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                    <div className="flex flex-col items-center md:items-start bg-(--bg-secondary) border border-(--border-muted) px-4 py-2.5 rounded-xl min-w-30">
                        <span className="text-xs text-(--text-tertiary) font-semibold uppercase tracking-wider mb-1">Overall Rating</span>
                        <div className="flex items-center gap-1.5 text-lg font-bold text-(--badge-warning-text)">
                            <StarRating
                                rating={host.ratingAverage} 
                                size={18} 
                                className="text-(--badge-warning-text)" 
                                emptyColorClassName="text-white/20" 
                            />
                            {host.ratingAverage > 0 ? host.ratingAverage.toFixed(1) : "New"}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center md:items-start bg-(--bg-secondary) border border-(--border-muted) px-4 py-2.5 rounded-xl min-w-30">
                        <span className="text-xs text-(--text-tertiary) font-semibold uppercase tracking-wider mb-1">Ovations</span>
                        <div className="text-lg font-bold text-(--heading-primary)">
                            {host.totalReviews}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm font-medium">
                    <div className="flex items-center gap-2 bg-(--bg-accent) px-3 py-1.5 rounded-full text-(--brand-primary)">
                        <Mail size={14} />
                        {host.email}
                    </div>
                    {host.mobile && (
                        <div className="flex items-center gap-2 bg-(--bg-accent) px-3 py-1.5 rounded-full text-(--brand-primary)">
                            <Phone size={14} />
                            {host.mobile}
                        </div>
                    )}
                    {host.businessAddress && (
                        <div className="flex items-center gap-2 bg-(--bg-secondary) border border-(--border-muted) px-3 py-1.5 rounded-full text-(--text-secondary)">
                            <MapPin size={14} />
                            {host.businessAddress}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}