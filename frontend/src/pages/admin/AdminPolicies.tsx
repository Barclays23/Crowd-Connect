// frontend/src/pages/admin/AdminPolicies.tsx

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";
import { platformSettingsService } from "@/services/platformSettingsService";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { type ITermsAndConditions } from "@/types/platformSettings.types";
import { POLICY_SECTIONS } from "@/constants/platformSettings.constants";
import type { ApiResponse } from "@/types/common.types";






export default function AdminPolicies() {
    const [settings, setSettings] = useState<Partial<ITermsAndConditions> | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);


    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response: ApiResponse<ITermsAndConditions> = await platformSettingsService.getTerms();
                setSettings(response.data);
                
            } catch (error: unknown) {
                console.error("Failed to fetch terms & conditions:", error);
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
    };


    const handleUpdatePoint = (key: keyof ITermsAndConditions, index: number, value: string) => {
        setSettings((prev) => {
            if (!prev) return prev;
            const newArray = [...((prev[key] as string[]) || [])];
            newArray[index] = value;
            return { ...prev, [key]: newArray };
        });
    };


    const handleRemovePoint = (key: keyof ITermsAndConditions, index: number) => {
        setSettings((prev) => {
            if (!prev) return prev;
            const newArray = [...((prev[key] as string[]) || [])];
            newArray.splice(index, 1);
            return { ...prev, [key]: newArray };
        });
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
            toast.success(response.message);
            
            setSettings(prev => ({ ...prev, ...payload }));

        } catch (error: unknown) {
            console.error("Failed to update terms & conditions:", error);
            const errorMessage: string = getApiErrorMessage(error);
            if (errorMessage) toast.error(errorMessage);

        } finally {
            setSaving(false);
        }
    };


    if (loading) return <AdminLayout><LoadingSpinner1 message="Loading Policies..." size="lg" /></AdminLayout>;



    return (
        <AdminLayout>
            <div className="max-w-4xl space-y-6 pb-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-(--heading-primary)">Terms & Conditions</h1>
                        <p className="text-sm text-(--text-secondary) mt-1">Manage bullet-point policies displayed across the platform.</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </Button>
                </div>

                <div className="space-y-8">
                    {POLICY_SECTIONS.map((section) => {
                        const key = section.key as keyof ITermsAndConditions;
                        const terms = (settings?.[key] as string[]) || [];

                        return (
                            <section key={key} className="bg-(--card-secondary) border border-(--border-default) rounded-xl p-6">
                                <div className="mb-4">
                                    <h2 className="text-lg font-semibold text-(--heading-primary)">{section.title}</h2>
                                    <p className="text-xs text-(--text-secondary)">{section.desc}</p>
                                </div>

                                <div className="space-y-3">
                                    {terms.map((term, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-(--brand-primary) shrink-0" />
                                            <Input
                                                value={term}
                                                onChange={(e) => handleUpdatePoint(key, index, e.target.value)}
                                                placeholder="Enter policy detail..."
                                                className="flex-1"
                                            />
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleRemovePoint(key, index)}
                                                className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleAddPoint(section.key)}
                                        className="mt-2 gap-2 text-xs"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Point
                                    </Button>
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </AdminLayout>
    );
}