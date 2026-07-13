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
import { type IPlatformSettings } from "@/types/platformSettings.types";
import { POLICY_SECTIONS } from "@/constants/platformSettings.constants";
import type { ApiResponse } from "@/types/common.types";






export default function AdminPolicies() {
    const [settings, setSettings] = useState<Partial<IPlatformSettings> | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response: ApiResponse<IPlatformSettings> = await platformSettingsService.getSettings();
                setSettings(response.data);
                
            } catch (error: unknown) {
                toast.error(getApiErrorMessage(error) || "Failed to load policies");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleAddPoint = (key: keyof IPlatformSettings) => {
        setSettings((prev) => {
            if (!prev) return prev;
            const currentArray = (prev[key] as string[]) || [];
            return { ...prev, [key]: [...currentArray, ""] };
        });
    };

    const handleUpdatePoint = (key: keyof IPlatformSettings, index: number, value: string) => {
        setSettings((prev) => {
            if (!prev) return prev;
            const newArray = [...((prev[key] as string[]) || [])];
            newArray[index] = value;
            return { ...prev, [key]: newArray };
        });
    };

    const handleRemovePoint = (key: keyof IPlatformSettings, index: number) => {
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
            const payload: Partial<IPlatformSettings> = {};
            POLICY_SECTIONS.forEach((sec) => {
                const currentTerms = settings[sec.key] as string[] | undefined;
                
                payload[sec.key] = (currentTerms || []).filter(str => str.trim() !== "");
            });

            const response = await platformSettingsService.updateSettings(payload);
            toast.success("Policies updated successfully");
            
            setSettings(prev => ({ ...prev, ...payload }));

        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error) || "Failed to save policies");
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
                        const terms = (settings?.[section.key] as string[]) || [];

                        return (
                            <section key={section.key} className="bg-(--card-secondary) border border-(--border-default) rounded-xl p-6">
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
                                                onChange={(e) => handleUpdatePoint(section.key, index, e.target.value)}
                                                placeholder="Enter policy detail..."
                                                className="flex-1"
                                            />
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleRemovePoint(section.key, index)}
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