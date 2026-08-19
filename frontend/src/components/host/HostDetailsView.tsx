// frontend/src/components/user/HostDetailsView.tsx
import type { UserState } from '@/types/user.types';
import { capitalize } from '@/utils/namingConventions';
import { formatDate1 } from '@/utils/dateAndTime.utils';
import { StarRating } from '@/components/shared/StarRating';
import { FileText } from 'lucide-react';

interface HostDetailsViewProps {
    profile: UserState;
}

export const HostDetailsView = ({ profile }: HostDetailsViewProps) => {
    return (
        <div className="space-y-6 md:space-y-8">
            
            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Left Column */}
                <div className="space-y-5 md:space-y-6">
                    <div>
                        <p className="text-xs md:text-sm font-medium text-(--brand-primary-light)">Organization Name</p>
                        <p className="text-sm md:text-base font-medium text-(--text-primary) mt-1 md:mt-1.5">
                            {profile.organizationName || '—'}
                        </p>
                    </div>
                    
                    <div>
                        <p className="text-xs md:text-sm font-medium text-(--brand-primary-light)">Registration Number</p>
                        <p className="text-sm md:text-base font-medium text-(--text-primary) mt-1 md:mt-1.5 font-mono">
                            {profile.registrationNumber || '—'}
                        </p>
                    </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-5 md:space-y-6">
                    <div>
                        <p className="text-xs md:text-sm font-medium text-(--brand-primary-light)">Description</p>
                        <p className="text-sm md:text-base text-(--text-primary) mt-1 md:mt-1.5 leading-relaxed whitespace-pre-wrap">
                            {profile.organizationDescription || '—'}
                        </p>
                    </div>
                    
                    <div>
                        <p className="text-xs md:text-sm font-medium text-(--brand-primary-light)">Business Address</p>
                        <p className="text-sm md:text-base text-(--text-primary) mt-1 md:mt-1.5 leading-relaxed whitespace-pre-wrap">
                            {profile.businessAddress || '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Ratings Block */}
            {profile.hostStatus === 'approved' && (
                <div className="pt-2">
                    <label className="block text-xs md:text-sm font-medium text-(--brand-primary-light) mb-2">
                        Your Host Rating
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2.5 px-4 md:px-5 py-2 md:py-2.5 bg-(--bg-primary) rounded-full border border-(--border-default) shadow-md w-fit">
                            {profile.ratingAverage && profile.ratingAverage > 0 ? (
                                <>
                                    <span className="font-bold text-(--text-primary) text-base md:text-lg leading-none">
                                        {profile.ratingAverage.toFixed(1)}
                                    </span>
                                    {/* Consider making the StarRating size slightly responsive via props if supported, e.g. size={16} on mobile */}
                                    <StarRating rating={profile.ratingAverage} size={18} /> 
                                </>
                            ) : (
                                <span className="text-xs md:text-sm font-medium text-(--text-secondary)">No rating yet</span>
                            )}
                        </div>
                        {(profile.totalReviews ?? 0) > 0 && (
                            <span className="text-xs md:text-sm font-medium text-(--text-tertiary) pl-1 sm:pl-0">
                                based on {profile.totalReviews} ovations
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Status & Metadata */}
            <div className="pt-4 md:pt-5 mt-2 md:mt-4 border-t border-(--border-muted)">
                <div className="flex flex-wrap gap-x-8 md:gap-x-10 gap-y-5 md:gap-y-6">
                    <div>
                        <p className="text-xs md:text-sm font-medium text-(--brand-primary-light)">Hosting Permission</p>
                        <p className={`text-sm md:text-base mt-1 md:mt-1.5 ${
                            profile.hostStatus === 'approved' ? 'text-(--status-success) font-semibold'
                            : profile.hostStatus === 'rejected' || profile.hostStatus === 'blocked' ? 'text-(--status-error) font-semibold'
                            : 'text-(--badge-warning-text) font-semibold'
                        }`}>
                            {capitalize(profile.hostStatus || '—')}
                        </p>
                    </div>

                    {profile.hostAppliedAt && (
                        <div>
                            <p className="text-xs md:text-sm font-medium text-(--brand-primary-light)">Applied On</p>
                            <p className="text-sm md:text-base font-medium text-(--text-primary) mt-1 md:mt-1.5">
                                {formatDate1(profile.hostAppliedAt)}
                            </p>
                        </div>
                    )}

                    {profile.reviewedAt && (
                        <div>
                            <p className="text-xs md:text-sm font-medium text-(--brand-primary-light)">Reviewed On</p>
                            <p className="text-sm md:text-base font-medium text-(--text-primary) mt-1 md:mt-1.5">
                                {formatDate1(profile.reviewedAt)}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Rejection Reason */}
            {profile.hostStatus === 'rejected' && profile.hostRejectionReason && (
                <div className="mt-3 md:mt-4">
                    <label className="block text-xs md:text-sm font-medium text-(--brand-primary-light) mb-2">
                        Rejection Reason
                    </label>
                    <div className="p-3 md:p-4 bg-(--badge-error-bg) border border-(--badge-error-border) rounded-xl text-(--badge-error-text) text-xs md:text-sm shadow-sm">
                        {profile.hostRejectionReason}
                    </div>
                </div>
            )}

            {/* Certificate Link */}
            {profile.certificateUrl && (
                <div className="mt-3 md:mt-4">
                    <a
                        href={profile.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm md:text-base text-(--brand-primary) hover:text-(--brand-primary-hover) font-medium transition-colors"
                    >
                        <FileText className="h-4 w-4 md:h-5 md:w-5" />
                        <span>View Registration Certificate</span>
                        <span aria-hidden>→</span>
                    </a>
                </div>
            )}
        </div>
    );
};