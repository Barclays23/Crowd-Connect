// frontend/src/components/user/HostDetailsEdit.tsx
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { getApiErrorMessage } from '@/utils/errorMessages.utils';
import type { UserState } from '@/types/user.types';
import type { ApiResponse } from '@/types/common.types';
import { hostServices } from '@/services/hostServices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner1 } from '@/components/common/LoadingSpinner1';
import { ButtonLoader } from '@/components/common/ButtonLoader';
import { isPDF, getFileNameFromFileOrUrl } from '@/utils/fileUtils';
import { Document, Page } from 'react-pdf';
import { MAX_FILE_SIZE } from '@/schemas/host.schema';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';



interface HostDetailsEditProps {
    profile: UserState;
    onSuccess: (updatedData: UserState) => void;
    onCancel: () => void;
}


// move to constants
const allowedTypes = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];





export const HostDetailsEdit = ({ profile, onSuccess, onCancel }: HostDetailsEditProps) => {
    const [isUpdatingHostDetails, setIsUpdatingHostDetails] = useState(false);
    const [editFormData, setEditFormData] = useState({
        organizationName: profile.organizationName || '',
        registrationNumber: profile.registrationNumber || '',
        businessAddress: profile.businessAddress || '',
        organizationDescription: profile.organizationDescription || '',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [hostDocument, setHostDocument] = useState<File | null>(null);
    const [documentPreview, setDocumentPreview] = useState<string>("");
    const [documentError, setDocumentError] = useState<string>("");
    const [imageLoadError, setImageLoadError] = useState(false);
    const [pdfError, setPdfError] = useState<string>('');

    useEffect(() => {
        return () => {
           if (documentPreview && documentPreview.startsWith('blob:')) URL.revokeObjectURL(documentPreview);
        };
    }, [documentPreview]);

    useEffect(() => {
        setImageLoadError(false);
    }, [documentPreview, profile?.certificateUrl]);

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (documentPreview && documentPreview.startsWith('blob:')) URL.revokeObjectURL(documentPreview);

        if (file.size > MAX_FILE_SIZE) {
           setDocumentError("File size exceeds 5MB limit");
           setHostDocument(null);
           setDocumentPreview("");
           return;
        }

        if (!allowedTypes.includes(file.type)) {
           setDocumentError("Invalid file type. Please upload PDF, JPG, or PNG.");
           setHostDocument(null);
           setDocumentPreview("");
           return;
        }

        setDocumentError("");
        setHostDocument(file);

        if (file.type === "application/pdf") {
           setDocumentPreview("pdf");
        } else {
           setDocumentPreview(URL.createObjectURL(file));
        }
    };

    const clearUploadedFile = () => {
        if (hostDocument) {
           if (documentPreview && documentPreview.startsWith('blob:')) URL.revokeObjectURL(documentPreview);
           setHostDocument(null);
           setDocumentPreview("");
           if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateHostDetails = async () => {
        try {
           setIsUpdatingHostDetails(true);
           const updateData = new FormData();
           updateData.append('organizationName', editFormData.organizationName.trim());
           updateData.append('registrationNumber', editFormData.registrationNumber.trim());
           updateData.append('businessAddress', editFormData.businessAddress.trim());
           updateData.append('organizationDescription', editFormData.organizationDescription.trim());
           
           if (hostDocument) {
               updateData.append('hostDocument', hostDocument);
           }
           
           const response: ApiResponse<UserState> = await hostServices.updateHostDetailsByHost(updateData);
           
           toast.success(response.message);
           onSuccess(response.data);
  
        } catch (err: unknown) {
           const errorMessage = getApiErrorMessage(err);
           if (errorMessage) toast.error(errorMessage);
        } finally {
           setIsUpdatingHostDetails(false);
        }
    };



    
    return (
        <div className="flex flex-col gap-6">
            
            {/* Form Fields Wrapper (Relative for the overlay) */}
            <div className="relative">
                {/* Component Loading Overlay */}
                {isUpdatingHostDetails && (
                    <div className="absolute -inset-4 z-50 flex items-center justify-center bg-(--bg-primary)/60 backdrop-blur-[1.5px] rounded-xl">
                        <LoadingSpinner1 size="lg" message="Uploading documents..." />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-(--text-secondary)">Organization Name</label>
                            <Input
                                type="text"
                                name="organizationName"
                                value={editFormData.organizationName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg)"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-(--text-secondary)">Registration Number</label>
                            <Input
                                type="text"
                                name="registrationNumber"
                                value={editFormData.registrationNumber}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg)"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-(--text-secondary)">Organization Description</label>
                            <textarea
                                name="organizationDescription"
                                value={editFormData.organizationDescription}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg) resize-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-(--text-secondary)">Business Address</label>
                            <textarea
                                name="businessAddress"
                                value={editFormData.businessAddress}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full px-4 py-2 border border-(--form-input-border) rounded-lg bg-(--form-input-bg) resize-none"
                            />
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-3 mt-2">
                        <label className="text-sm font-medium text-(--text-secondary)">
                            Business Registration Document / Certificate
                            {profile.certificateUrl && (
                                <span className="text-xs font-normal text-(--status-success) ml-2">
                                    (Optional - upload only if replacing existing document)
                                </span>
                            )}
                        </label>

                        <div
                            className="border-2 border-dashed border-(--border-muted) rounded-xl p-6 text-center cursor-pointer hover:border-(--brand-primary-light) transition-colors bg-(--bg-primary)"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {(documentPreview || profile?.certificateUrl) ? (
                                <div className="space-y-4">
                                    {(documentPreview === "pdf" || hostDocument?.type === "application/pdf" || (!hostDocument && isPDF(profile?.certificateUrl))) ? (
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="relative w-full max-w-md border border-(--border-muted) rounded-lg overflow-hidden bg-(--card-bg) shadow-sm">
                                                <div className="flex justify-between items-center bg-(--bg-secondary) px-3 py-2 border-b border-(--border-muted)">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-(--status-error)" />
                                                        <span className="text-xs font-medium text-(--text-primary)">PDF Preview</span>
                                                    </div>
                                                    <div className="bg-(--status-error)/10 text-(--status-error) text-xs px-2 py-1 rounded">PDF</div>
                                                </div>

                                                <div className="relative h-64 overflow-auto bg-(--bg-secondary) flex items-center justify-center">
                                                    {pdfError ? (
                                                        <div className="text-center p-4">
                                                            <FileText className="h-12 w-12 text-(--text-tertiary) mx-auto mb-2" />
                                                            <p className="text-sm text-(--text-secondary)">PDF preview not available</p>
                                                            <p className="text-xs text-(--text-tertiary)">{pdfError}</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {hostDocument && hostDocument.type === "application/pdf" && (
                                                                <Document file={hostDocument} onLoadError={() => setPdfError('Failed to load PDF preview')} loading={<LoadingSpinner1 />}>
                                                                    <Page pageNumber={1} width={250} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-sm" />
                                                                </Document>
                                                            )}
                                                            {!hostDocument && profile?.certificateUrl && isPDF(profile.certificateUrl) && (
                                                                <Document file={profile.certificateUrl} onLoadError={() => setPdfError('Failed to load PDF preview')} loading={<LoadingSpinner1 />}>
                                                                    <Page pageNumber={1} width={250} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-sm" />
                                                                </Document>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-(--text-primary) truncate max-w-xs mx-auto">
                                                    {getFileNameFromFileOrUrl(hostDocument || profile?.certificateUrl, "Business Document")}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="relative max-h-64 overflow-hidden rounded-lg bg-(--bg-primary)">
                                                {imageLoadError ? (
                                                    <div className="flex flex-col items-center justify-center h-60 text-(--text-tertiary)">
                                                        <FileText className="h-12 w-12 mb-2" />
                                                        <p className="text-sm">Preview not available</p>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={(documentPreview && documentPreview !== "pdf") ? documentPreview : profile?.certificateUrl || ""}
                                                        alt="Document preview"
                                                        className="w-full h-auto object-contain max-h-60 mx-auto"
                                                        onError={() => setImageLoadError(true)}
                                                    />
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-(--text-primary) truncate max-w-xs mx-auto">
                                                    {getFileNameFromFileOrUrl(hostDocument || profile?.certificateUrl, "Business Document")}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-center gap-2">
                                        <Button type="button" variant="primaryOutline" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="gap-2">
                                            <Upload className="h-4 w-4" /> Change Document
                                        </Button>
                                        {hostDocument && (
                                            <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearUploadedFile(); }} className="gap-2 border border-(--border-muted)">
                                                <X className="h-4 w-4" /> Clear Selection
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 py-4">
                                    <div className="mx-auto w-14 h-14 bg-(--brand-primary-light)/20 rounded-full flex items-center justify-center">
                                        <Upload className="h-7 w-7 text-(--brand-primary)" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-(--text-primary)">Click to upload document</p>
                                        <p className="text-xs text-(--text-secondary) mt-1">Supports PDF, JPG, PNG (Max 5MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,image/jpeg,image/jpg,image/png"
                            className="hidden"
                            onChange={handleDocumentChange}
                            disabled={isUpdatingHostDetails}
                        />

                        {documentError && (
                            <div className="flex items-center gap-2 text-sm text-(--status-error) mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>{documentError}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons (Now Outside the Relative Overlay) */}
            <div className="flex gap-3 pt-4 border-t border-(--border-muted)">
                <Button
                    onClick={handleUpdateHostDetails}
                    disabled={isUpdatingHostDetails}
                    className="bg-(--btn-primary-bg) text-(--btn-primary-text) hover:bg-(--btn-primary-hover)"
                >
                    <ButtonLoader loading={isUpdatingHostDetails} loadingText="Saving changes...">
                        Save Changes
                    </ButtonLoader>
                </Button>
                <Button variant="outline" onClick={onCancel} disabled={isUpdatingHostDetails}>
                    Cancel
                </Button>
            </div>
        </div>
    );
};