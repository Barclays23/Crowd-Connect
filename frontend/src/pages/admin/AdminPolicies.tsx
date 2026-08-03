// frontend/src/pages/admin/AdminPolicies.tsx

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { platformSettingsService } from "@/services/platformSettingsService";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { Save, Loader2 } from "lucide-react";
import { type ITermsAndConditions } from "@/types/platformSettings.types";
import { POLICY_SECTIONS } from "@/constants/platformSettings.constants";
import type { ApiResponse } from "@/types/common.types";
import AdminBanner from "@/components/admin/admin-banner";
import { AdminPolicySection } from "@/components/admin/policy/AdminPolicySection";





export default function AdminPolicies() {
    const [settings, setSettings] = useState<Partial<ITermsAndConditions> | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // NEW: Track unsaved changes for the UI
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const [editingState, setEditingState] = useState<{ sectionKey: keyof ITermsAndConditions; index: number } | null>(null);
    const [editValue, setEditValue] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response: ApiResponse<ITermsAndConditions> = await platformSettingsService.getTerms();
                setSettings(response.data);
            } catch (error: unknown) {
                const errorMessage: string = getApiErrorMessage(error);
                if (errorMessage) toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleAddPoint = (key: keyof ITermsAndConditions) => {
        setSettings((prev) => {
            if (!prev) return prev;
            const currentArray = (prev[key] as string[]) || [];
            return { ...prev, [key]: [...currentArray, ""] };
        });
        
        const newIndex = (settings?.[key] as string[])?.length || 0;
        setEditingState({ sectionKey: key, index: newIndex });
        setEditValue("");
        setHasUnsavedChanges(true); // Flag changes
    };

    const handleRemovePoint = (key: keyof ITermsAndConditions, index: number) => {
        setSettings((prev) => {
            if (!prev) return prev;
            const newArray = [...((prev[key] as string[]) || [])];
            newArray.splice(index, 1);
            return { ...prev, [key]: newArray };
        });
        if (editingState?.sectionKey === key && editingState.index === index) {
            setEditingState(null);
        }
        setHasUnsavedChanges(true); // Flag changes
    };

    const startEditing = (key: keyof ITermsAndConditions, index: number, currentValue: string) => {
        setEditingState({ sectionKey: key, index });
        setEditValue(currentValue);
    };

    const cancelEditing = () => {
        setEditingState(null);
        setEditValue("");
    };

    const saveEdit = (sectionKey: keyof ITermsAndConditions, index: number, value: string) => {
        setSettings((prev) => {
            if (!prev) return prev;
            const newArray = [...((prev[sectionKey] as string[]) || [])];
            newArray[index] = value;
            return { ...prev, [sectionKey]: newArray };
        });
        setEditingState(null);
        setHasUnsavedChanges(true); // Flag changes
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);

        try {
            const payload = {} as ITermsAndConditions;
            POLICY_SECTIONS.forEach((sec) => {
                const key = sec.key as keyof ITermsAndConditions;
                const currentTerms = settings[key] as string[] | undefined;
                payload[key] = (currentTerms || []).filter(str => str.trim() !== "");
            });

            const response = await platformSettingsService.updateTerms(payload);
            toast.success(response.message || "Terms updated successfully");
            setSettings(prev => ({ ...prev, ...payload }));
            
            // Reset unsaved changes after successful save
            setHasUnsavedChanges(false); 
        } catch (error: unknown) {
            const errorMessage: string = getApiErrorMessage(error);
            if (errorMessage) toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <AdminLayout><LoadingSpinner1 message="Loading Policies..." size="lg" /></AdminLayout>;

    return (
        <AdminLayout>
            {/* Added extra padding bottom (pb-32) so the bottom content isn't hidden behind the floating bar */}
            {/* <div className="w-full mx-auto space-y-6 pb-32 relative"> */}
            <div className="max-w-5xl mx-auto space-y-6 pb-32 relative">
                
                <AdminBanner
                    title="Platform Policies & Terms"
                    description="Manage, edit, and organize the legal guidelines and policies displayed across CrowdConnect."
                />

                <div className="space-y-8">
                    {POLICY_SECTIONS.map((section) => (
                        <AdminPolicySection
                            key={section.key}
                            sectionKey={section.key as keyof ITermsAndConditions}
                            title={section.title}
                            description={section.desc}
                            terms={(settings?.[section.key as keyof ITermsAndConditions] as string[]) || []}
                            onAddPoint={handleAddPoint}
                            onRemovePoint={handleRemovePoint}
                            onSaveEdit={saveEdit}
                            editingState={editingState}
                            onStartEditing={startEditing}
                            onCancelEditing={cancelEditing}
                            editValue={editValue}
                            setEditValue={setEditValue}
                        />
                    ))}
                </div>

                {/* --- NEW: Fixed Floating Action Bar --- */}
                {/* 'fixed bottom-8 right-8' locks it to the browser viewport's bottom right corner */}
                <div className="fixed bottom-8 right-8 z-50 flex justify-end pointer-events-none">
                    <div 
                        className={`pointer-events-auto p-3 rounded-2xl border transition-all duration-300 shadow-(--shadow-lg) ${
                            hasUnsavedChanges 
                                ? "bg-(--card-secondary) border-(--border-brand) shadow-[0_0_20px_rgba(255,107,107,0.3)] scale-100 opacity-100" 
                                : "bg-(--card-bg) border-(--border-default) scale-95 opacity-80 hover:opacity-100 hover:scale-100"
                        }`}
                    >
                        <div className="flex items-center gap-4 px-2">
                            {/* Visual Warning Indicator */}
                            {hasUnsavedChanges && (
                                <span className="text-sm font-medium text-(--status-error) animate-pulse flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-(--status-error)"></div>
                                    Unsaved changes
                                </span>
                            )}
                            
                            <Button 
                                variant="default"
                                onClick={handleSave} 
                                disabled={saving || !hasUnsavedChanges} 
                                className="gap-2 px-6 bg-(--btn-primary-bg) hover:bg-(--btn-primary-hover) text-(--btn-primary-text)"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save All Changes
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}