// frontend/src/components/shared/TermsModal.tsx

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { platformSettingsService } from "@/services/platformSettingsService";
import { LoadingSpinner1 } from "@/components/shared/LoadingSpinner1";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { FormatMarkdown } from "@/components/shared/FormatMarkdown";
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
                const response = await platformSettingsService.getTerms();
                
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
            size="lg"
        >
            <div className="p-4 max-h-[70vh] overflow-y-auto overscroll-contain bg-(--modal-content-bg) rounded-b-lg">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <LoadingSpinner1 message="Loading terms..." size="md" />
                    </div>
                ) : termsText.length > 0 ? (
                    <div className="space-y-8 p-2">
                        {termsText.map((paragraph, index) => (
                            <div key={index} className="flex gap-4">
                                {/* Theme-compliant Number Badge */}
                                <div className="shrink-0 w-8 h-8 rounded-full bg-(--badge-primary-bg) text-(--badge-primary-text) border border-(--badge-primary-border) flex items-center justify-center font-bold text-sm shadow-(--shadow-xs)">
                                    {index + 1}
                                </div>
                                
                                {/* Formatted text wrapper */}
                                <div className="flex-1 mt-1">
                                    <FormatMarkdown text={paragraph} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-sm text-(--text-tertiary) italic">
                        No terms available at the moment.
                    </div>
                )}
            </div>
        </Modal>
    );
}