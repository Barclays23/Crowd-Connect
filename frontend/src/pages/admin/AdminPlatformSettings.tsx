// frontend/src/pages/admin/AdminPlatformSettings.tsx
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { toast } from "react-toastify";
import type { IPlatformSettings, SettingsResponse } from "@/types/platformSettings.types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonLoader } from "@/components/common/ButtonLoader";
import { LoadingSpinner1 } from "@/components/common/LoadingSpinner1";

import { platformSettingsService } from "@/services/platformSettingsService";
import { Pencil, X, Check } from "lucide-react";
import { getApiErrorMessage } from "@/utils/errorMessages.utils";




// ── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({
    label,
    description,
    value = 0,
    editValue = 0,
    isEditing,
    onChange,
    min = 0,
    max,
    suffix = "%",
}: {
    label: string;
    description: string;
    value?: number;
    editValue?: number;
    isEditing: boolean;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    suffix?: string;
}) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-(--border-muted) last:border-0">
            <div className="flex-1 pr-8">
                <p className="text-sm font-medium text-(--text-primary)">{label}</p>
                <p className="text-xs text-(--text-secondary) mt-0.5">{description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {isEditing ? (
                    <Input
                        type="number"
                        min={min}
                        max={max}
                        value={editValue}
                        onChange={(e) => onChange(Number(e.target.value) || 0)}
                        className="w-24 text-center"
                    />
                ) : (
                    <span className="w-24 text-center text-sm font-semibold text-(--text-primary) bg-(--bg-tertiary) rounded-lg px-3 py-1.5 border border-(--border-muted)">
                        {value}
                    </span>
                )}
                <span className="text-sm text-(--text-secondary) w-8">{suffix}</span>
            </div>
        </div>
    );
}




// ── Section wrapper ──────────────────────────────────────────────────────────
function SettingsSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border border-(--border-default) bg-(--card-secondary) p-6">
            <h2 className="font-semibold text-(--heading-primary) mb-1">{title}</h2>
            <p className="text-xs text-(--text-secondary) mb-4">{description}</p>
            <div className="space-y-1">{children}</div>
        </section>
    );
}





// ── Main Component ───────────────────────────────────────────────────────────
const AdminPlatformSettings = () => {
    const [savedSettings, setSavedSettings] = useState<IPlatformSettings | null>(null);
    const [draftSettings, setDraftSettings] = useState<Partial<IPlatformSettings>>({});

    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);


    const extractSettings = (response: SettingsResponse | IPlatformSettings | unknown): IPlatformSettings => {
        const res = response as any; // temporary cast only inside function

        if (res?.data?.settingsData) return res.data.settingsData;
        if (res?.settingsData) return res.settingsData;
        if (res?.data) return res.data;

        return res as IPlatformSettings;
    };
    

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const response: SettingsResponse = await platformSettingsService.getSettings();
                const settings = extractSettings(response);

                setSavedSettings(settings);
                setDraftSettings({ ...settings });

            } catch (error: unknown) {
                console.error("Failed to load settings:", error);
                const errorMessage: string = getApiErrorMessage(error)
                toast.error(errorMessage || "Failed to load settings");

            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleEdit = () => {
        if (savedSettings) {
            setDraftSettings({ ...savedSettings });
            setIsEditing(true);
        }
    };

    const handleCancel = () => {
        if (savedSettings) {
            setDraftSettings({ ...savedSettings });
        }
        setIsEditing(false);
    };

    const updateDraft = (key: keyof IPlatformSettings, value: number) => {
        setDraftSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!draftSettings) return;
        setSaving(true);

        try {
            const response: SettingsResponse = await platformSettingsService.updateSettings(draftSettings as IPlatformSettings);
            const updatedSettings = extractSettings(response);

            setSavedSettings(updatedSettings);
            setDraftSettings({ ...updatedSettings });
            setIsEditing(false);
            
            toast.success("Settings saved successfully");

        } catch (error: unknown) {
            console.error("Failed to save settings:", error);
            const errorMessage: string = getApiErrorMessage(error)
            toast.error(errorMessage || "Failed to save settings");

        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <LoadingSpinner1 message="Loading platform settings..." size="md" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-2xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-(--heading-primary)">Platform Settings</h1>
                        <p className="text-sm text-(--text-secondary) mt-1">
                            Configure refund policies and commission. Changes apply immediately.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isEditing ? (
                            <Button onClick={handleEdit} variant="secondary" className="flex items-center gap-2">
                                <Pencil className="w-4 h-4" />
                                Edit
                            </Button>
                        ) : (
                            <>
                                <Button onClick={handleCancel} variant="secondary" disabled={saving}>
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={saving}>
                                    <ButtonLoader loading={saving} loadingText="Saving...">
                                        <Check className="w-4 h-4 mr-1" />
                                        Save
                                    </ButtonLoader>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <div className="bg-(--bg-secondary) border border-(--border-muted) rounded-lg px-4 py-3 text-sm flex items-center gap-2 text-(--text-secondary)">
                        <Pencil className="w-4 h-4" />
                        You are in edit mode. Make your changes and click Save.
                    </div>
                )}

                {/* Commission */}
                <SettingsSection
                    title="Commission"
                    description="Percentage deducted from each booking payout to the host."
                >
                    <SettingRow
                        label="Admin Commission"
                        description="Applied on every paid booking when calculating host payout"
                        value={savedSettings?.commissionPercent ?? 0}
                        editValue={draftSettings.commissionPercent ?? 0}
                        isEditing={isEditing}
                        onChange={(v) => updateDraft("commissionPercent", v)}
                        max={100}
                    />
                </SettingsSection>

                {/* Refund Policy */}
                <SettingsSection
                    title="Refund Policy"
                    description="Time windows and refund rates for user-initiated booking cancellations."
                >
                    <SettingRow
                        label="Tier 1 cutoff"
                        description="Users get full Tier 1 refund if they cancel at least this many hours before the event"
                        value={savedSettings?.refundTier1Hours ?? 0}
                        editValue={draftSettings.refundTier1Hours ?? 0}
                        isEditing={isEditing}
                        onChange={(v) => updateDraft("refundTier1Hours", v)}
                        suffix="hrs"
                    />
                    <SettingRow
                        label="Tier 1 refund %"
                        description={`Refund given when cancelled ≥ ${savedSettings?.refundTier1Hours ?? 0} hrs before event`}
                        value={savedSettings?.refundTier1Percent ?? 0}
                        editValue={draftSettings.refundTier1Percent ?? 0}
                        isEditing={isEditing}
                        onChange={(v) => updateDraft("refundTier1Percent", v)}
                        max={100}
                    />
                    {/* Add other rows similarly with nullish coalescing */}
                    <SettingRow
                        label="Tier 2 cutoff"
                        description="Users get Tier 2 refund if cancelling between Tier 2 and Tier 1 cutoff"
                        value={savedSettings?.refundTier2Hours ?? 0}
                        editValue={draftSettings.refundTier2Hours ?? 0}
                        isEditing={isEditing}
                        onChange={(v) => updateDraft("refundTier2Hours", v)}
                        suffix="hrs"
                    />
                    <SettingRow
                        label="Tier 2 refund %"
                        description="Refund given when cancelled between Tier 2 and Tier 1 cutoff"
                        value={savedSettings?.refundTier2Percent ?? 0}
                        editValue={draftSettings.refundTier2Percent ?? 0}
                        isEditing={isEditing}
                        onChange={(v) => updateDraft("refundTier2Percent", v)}
                        max={100}
                    />
                    <SettingRow
                        label="Tier 3 refund %"
                        description="Refund given when cancelled < Tier 2 cutoff (minimum refund)"
                        value={savedSettings?.refundTier3Percent ?? 0}
                        editValue={draftSettings.refundTier3Percent ?? 0}
                        isEditing={isEditing}
                        onChange={(v) => updateDraft("refundTier3Percent", v)}
                        max={100}
                    />
                </SettingsSection>

                {/* Grace Period */}
                <SettingsSection
                    title="Grace Period"
                    description="When an event has a major change (venue, date), attendees get a window to cancel with a guaranteed refund."
                >
                    <SettingRow
                        label="Grace period window"
                        description="How long attendees have to cancel after a major event change"
                        value={savedSettings?.gracePeriodHours ?? 0}
                        editValue={draftSettings.gracePeriodHours ?? 0}
                        isEditing={isEditing}
                        onChange={(v) => updateDraft("gracePeriodHours", v)}
                        suffix="hrs"
                    />
                    <SettingRow
                        label="Grace period refund %"
                        description="Refund % if user cancels within the grace period"
                        value={savedSettings?.gracePeriodRefundPercent ?? 0}
                        editValue={draftSettings.gracePeriodRefundPercent ?? 0}
                        isEditing={isEditing}
                        onChange={(v) => updateDraft("gracePeriodRefundPercent", v)}
                        max={100}
                    />
                </SettingsSection>

                {/* Attendance Policy */}
                <SettingsSection
                    title="Payout Requirements"
                    description="Conditions hosts must meet to request an automatic payout."
                >
                    <SettingRow
                        label="Minimum Attendance %"
                        description="If event attendance is below this, hosts must upload image proof to request payout."
                        value={savedSettings?.minPayoutAttendancePercent ?? 30}
                        editValue={draftSettings.minPayoutAttendancePercent ?? 30}
                        isEditing={isEditing}
                        onChange={(v) => updateDraft("minPayoutAttendancePercent", v)}
                        max={100}
                    />
                </SettingsSection>
            </div>
        </AdminLayout>
    );
};

export default AdminPlatformSettings;