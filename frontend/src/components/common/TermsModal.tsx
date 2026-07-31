// frontend/src/components/common/TermsModal.tsx
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { platformSettingsService } from "@/services/platformSettingsService";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import type { ITermsAndConditions } from "@/types/platformSettings.types";


interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    termTypes: Array<keyof ITermsAndConditions>;
    title: string;
}


export function TermsModal({ isOpen, onClose, termTypes, title }: TermsModalProps) {
    const [termsText, setTermsText] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchTerms = async () => {
            try {
                setIsLoading(true);
                // Fetches the lightweight terms arrays via the public GET /terms endpoint
                const response = await platformSettingsService.getTerms();
                
                // Combine the requested term types into a single array
                let combinedTerms: string[] = [];
                termTypes.forEach(type => {
                    const termsArray = response.data[type];
                    if (termsArray && Array.isArray(termsArray)) {
                        combinedTerms = [...combinedTerms, ...termsArray];
                    }
                });

                setTermsText(combinedTerms);
            } catch (error: unknown) {
                toast.error(getApiErrorMessage(error) || "Failed to load terms.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTerms();
    }, [isOpen, termTypes]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="md"
        >
            <div className="p-1 max-h-[60vh] overflow-y-auto overscroll-contain">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <LoadingSpinner1 message="Loading terms..." size="md" />
                    </div>
                ) : termsText.length > 0 ? (
                    <ul className="space-y-4 text-sm text-(--text-secondary) list-disc pl-5">
                        {termsText.map((paragraph, index) => (
                            <li key={index} className="leading-relaxed text-justify">
                                {paragraph}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="py-8 text-center text-sm text-(--text-tertiary) italic">
                        No terms available at the moment.
                    </div>
                )}
            </div>
        </Modal>
    );
}