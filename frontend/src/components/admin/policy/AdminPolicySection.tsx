// frontend/src/components/admin/AdminPolicySection.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { FormatMarkdown } from "@/components/common/FormatMarkdown";
import { type ITermsAndConditions } from "@/types/platformSettings.types";
import { TextArea } from "@/components/ui/text-area";



interface PolicySectionProps {
    sectionKey: keyof ITermsAndConditions;
    title: string;
    description: string;
    terms: string[];
    onAddPoint: (key: keyof ITermsAndConditions) => void;
    onRemovePoint: (key: keyof ITermsAndConditions, index: number) => void;
    onSaveEdit: (key: keyof ITermsAndConditions, index: number, value: string) => void;
    editingState: { sectionKey: keyof ITermsAndConditions; index: number } | null;
    onStartEditing: (key: keyof ITermsAndConditions, index: number, currentValue: string) => void;
    onCancelEditing: () => void;
    editValue: string;
    setEditValue: (val: string) => void;
}



export const AdminPolicySection: React.FC<PolicySectionProps> = ({
    sectionKey,
    title,
    description,
    terms,
    onAddPoint,
    onRemovePoint,
    onSaveEdit,
    editingState,
    onStartEditing,
    onCancelEditing,
    editValue,
    setEditValue
}) => {
    return (
        <section className="bg-(--card-secondary) border border-(--card-border) rounded-xl p-6 shadow-(--shadow-sm)">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-semibold text-(--heading-primary)">{title}</h2>
                    <p className="text-sm text-(--text-secondary)">{description}</p>
                </div>
                <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => onAddPoint(sectionKey)} 
                    className="gap-2 hover:bg-(--btn-neutral-hover) "
                >
                    <Plus className="w-3.5 h-3.5" /> Add Point
                </Button>
            </div>

            <div className="space-y-4">
                {terms.map((term, index) => {
                    const isEditing = editingState?.sectionKey === sectionKey && editingState?.index === index;

                    return (
                        <div key={index} className="flex gap-4 p-5 rounded-lg bg-(--card-bg) border border-(--border-muted) shadow-(--shadow-xs) hover:shadow-(--shadow-sm) transition-shadow">
                            
                            {/* Number Badge */}
                            <div className="shrink-0 w-8 h-8 rounded-full bg-(--badge-primary-bg) text-(--badge-primary-text) border border-(--badge-primary-border) flex items-center justify-center font-bold text-sm">
                                {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <TextArea
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            placeholder="Use **bold** for headers. Press Enter for line breaks..."
                                            className="min-h-37.5 resize-y bg-(--form-input-bg) text-(--form-input-text) border-(--form-input-border) focus:ring-(--form-focus-ring)"
                                        />
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm"
                                                variant={"default"}
                                                onClick={() => onSaveEdit(sectionKey, index, editValue)}
                                            >
                                                Save Point
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="secondary" 
                                                onClick={onCancelEditing}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <FormatMarkdown text={term} />
                                )}
                            </div>

                            {/* Action Buttons */}
                            {!isEditing && (
                                <div className="shrink-0 flex gap-2">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => onStartEditing(sectionKey, index, term)}
                                        className="text-(--text-secondary)"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => onRemovePoint(sectionKey, index)}
                                        className="text-(--status-error)"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}
                {terms.length === 0 && (
                    <div className="text-center py-6 text-sm text-(--text-tertiary) italic bg-(--bg-primary) rounded-lg border border-dashed border-(--border-muted)">
                        No terms added to this section yet.
                    </div>
                )}
            </div>
        </section>
    );
};