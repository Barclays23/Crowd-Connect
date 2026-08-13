// backend/src/services/host-servies/implementations/hostManagement.service.ts
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { 
    HostManageApplicationDto,
    HostManagePermissionDto,
    HostStatusUpdateResponseDto, 
    HostUpdateRequestDto, 
    HostUpgradeRequestDto, 
    OrganiserProfileResponseDTO, 
    UserProfileResponseDto 
} from "@/dtos/user.dto";
import { createHttpError } from "@/utils/httpError.utils";
import { HTTP_STATUS } from "@/constants/http-status.constants";
import { 
    HostEntity, 
    HostManageInput, 
    HostUpdateInput, 
    UpgradeHostInput, 
    UserEntity, 
    UserProfileEntity 
} from "@/entities/user.entity";
import { deleteFromCloudinary, uploadToCloudinary } from "@/config/cloudinary";
import { isHost } from "@/utils/general.utils";
import { 
    mapToHostManageInput,
    mapHostUpgradeRequestDtoToInput, 
    mapUserEntityToProfileDto,
    mapToHostStatusUpdateResponseDto,
    mapToOrganiserProfileDTO,
    mapAdminHostLogoUpdateToInput,
    mapAdminHostDetailsUpdateToInput,
    mapHostDetailsUpdateToInput, 
} from "@/mappers/user.mapper";
import { HOST_STATUS, HostStatus, USER_ROLES } from "@/constants/user-system.constants";
import { GetHostsFilter, GetHostsResult, UserFilterQuery } from "@/types/user.types";
import { IHostManagementServices } from "../interfaces/IHostManagementServices";
import { HOST_MESSAGES, USER_MESSAGES } from "@/constants/messages.constants";
import { validateAllowedToApplyRoleUpgrade, validateAllowedToUpdateHost } from "@/utils/validations/userValidations";




export class HostManagementServices implements IHostManagementServices {
    constructor(
        private _userRepository: IUserRepository,
    ) {}


    async applyHostRoleUpgrade({ userId, upgradeDto, documentFile, logoFile }: {
        userId: string;
        upgradeDto: HostUpgradeRequestDto;
        documentFile: Express.Multer.File;
        logoFile: Express.Multer.File;
    }): Promise<HostEntity> {
        try {
            console.log("✅✅✅✅✅ received data in HostManagementServices.applyHostRoleUpgrade ----");
            console.log("userId:", userId);
            console.log("upgradeDto:", upgradeDto);
            console.log("fileName:", documentFile?.originalname);

            const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(userId);

            validateAllowedToApplyRoleUpgrade(existingUser);

            let hostDocumentUrl: string | undefined;
            let organizationLogoUrl: string | undefined;

            // Handle Document Upload
            if (documentFile){
                hostDocumentUrl = await uploadToCloudinary({
                    fileBuffer: documentFile.buffer,
                    folderPath: 'host-documents',
                    fileType: 'image',
                });

                console.log('new hostDocumentUrl:', hostDocumentUrl);

                if (existingUser.certificateUrl && existingUser.certificateUrl.trim() !== '') {
                    try {
                        await deleteFromCloudinary({fileUrl: existingUser.certificateUrl, resourceType: 'image'});
                    } catch (cleanupErr) {
                        console.warn("Failed to delete host document from Cloudinary:", cleanupErr);
                    }
                }
            }

            // Handle Logo Upload
            if (logoFile) {
                organizationLogoUrl = await uploadToCloudinary({
                    fileBuffer: logoFile.buffer,
                    folderPath: 'host-logos',
                    fileType: 'image',
                });
                if (existingUser.organizationLogo) {
                    await deleteFromCloudinary({ fileUrl: existingUser.organizationLogo, resourceType: 'image' }).catch(() => {});
                }
            }

            const upgradeInput: UpgradeHostInput = mapHostUpgradeRequestDtoToInput({upgradeDto, hostDocumentUrl, organizationLogoUrl});

            const hostEntity: HostEntity | null = await this._userRepository.updateHostDetails(userId, upgradeInput);

            if (!hostEntity) {
                throw new Error("Failed to update host details. User not found."); 
            }

            console.log('hostEntity after applyHostUpgrade:', hostEntity);

            return hostEntity;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in HostManagementServices.applyHostRoleUpgrade:', msg);
            throw error;
        }
    }


    async manageHostApplication({ hostId, action, reason }: HostManageApplicationDto): Promise<HostStatusUpdateResponseDto> {
        try {
            const hostEntity: HostEntity | null = await this._userRepository.getHostById(hostId);
            if (!hostEntity) {
                throw createHttpError(HTTP_STATUS.NOT_FOUND, HOST_MESSAGES.HOST_NOT_FOUND);
            }

            // Only PENDING hosts can be approved or rejected
            if (hostEntity.hostStatus !== HOST_STATUS.PENDING) {
                throw createHttpError(
                    HTTP_STATUS.BAD_REQUEST,
                    `Cannot ${action} a host application that is currently ${hostEntity.hostStatus}.`
                );
            }

            const hostStatusInput: HostManageInput = mapToHostManageInput({hostId, action, reason});
            
            const updatedHostEntity: HostEntity | null = await this._userRepository.updateHostStatus(hostId, hostStatusInput);

            if (!updatedHostEntity) {
                throw new Error("Failed to update host details. User not found."); 
            }

            const updatedStatusResponse: HostStatusUpdateResponseDto = mapToHostStatusUpdateResponseDto(updatedHostEntity)

            // Send notification to host (later)
            // await this._notificationService.sendHostStatusUpdate(
            //     hostEntity.userId,
            //     action,
            //     reason
            // );

            return updatedStatusResponse;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in HostManagementServices.manageHostApplication:', msg);
            throw error;
        }
    }


    async manageHostPermission({ hostId, action, reason }: HostManagePermissionDto): Promise<HostStatusUpdateResponseDto> {
        try {
            const hostEntity: HostEntity | null = await this._userRepository.getHostById(hostId);
            if (!hostEntity) {
                throw createHttpError(HTTP_STATUS.NOT_FOUND, HOST_MESSAGES.HOST_NOT_FOUND);
            }

            const allowedTransitions: Record<HostStatus, Array<HostManagePermissionDto["action"]>> = {
                [HOST_STATUS.PENDING]: ['block'],
                [HOST_STATUS.APPROVED]: ['block'],
                [HOST_STATUS.REJECTED]: ['block'],
                [HOST_STATUS.BLOCKED]: ['unblock'],  // Can only unblock if already blocked
            } as const;

            const allowedActions = allowedTransitions[hostEntity.hostStatus as HostStatus];

            if (!allowedActions || !allowedActions.includes(action)) {
                throw createHttpError(
                    HTTP_STATUS.BAD_REQUEST,
                    `Cannot ${action} a host that is currently in ${hostEntity.hostStatus} state.`
                );
            }

            const hostStatusInput: HostManageInput = mapToHostManageInput({hostId, action, reason});
            
            const updatedHostEntity: HostEntity | null = await this._userRepository.updateHostStatus(hostId, hostStatusInput);

            if (!updatedHostEntity) {
                throw new Error("Failed to update host details. User not found."); 
            }

            const updatedStatusResponse: HostStatusUpdateResponseDto = mapToHostStatusUpdateResponseDto(updatedHostEntity)

            // Send notification to host (later)
            // await this._notificationService.sendHostStatusUpdate(
            //     hostEntity.userId,
            //     action,
            //     reason
            // );

            return updatedStatusResponse;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in HostManagementServices.manageHostPermissions:', msg);
            throw error;
        }
    }


    async convertToHost({ userId, upgradeDto, documentFile, logoFile }: {
        userId: string;
        upgradeDto: HostUpgradeRequestDto;
        documentFile?: Express.Multer.File;
        logoFile?: Express.Multer.File;
    }): Promise<UserProfileEntity> {
        try {
            const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(userId);
            if (!existingUser) throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);

            let hostDocumentUrl: string | undefined;
            let organizationLogoUrl: string | undefined;

            if (documentFile) {
                hostDocumentUrl = await uploadToCloudinary({ fileBuffer: documentFile.buffer, folderPath: 'host-documents', fileType: 'image' });
            }
            if (logoFile) {
                organizationLogoUrl = await uploadToCloudinary({ fileBuffer: logoFile.buffer, folderPath: 'host-logos', fileType: 'image' });
            }

            const upgradeInput: UpgradeHostInput = mapHostUpgradeRequestDtoToInput({upgradeDto, hostDocumentUrl, organizationLogoUrl});
            
            // upgradeInput.hostStatus = HOST_STATUS.APPROVED;  // can approve later (or here if need)
            
            const hostEntity: UserProfileEntity | null = await this._userRepository.updateHostDetails(userId, upgradeInput);
            if (!hostEntity) throw new Error("Failed to convert user to host."); 

            return hostEntity;

        } catch (error: unknown) {
            throw error;
        }
    }


    async updateHostDetailsByHost({hostId, updateDto, documentFile}: {hostId: string; updateDto: HostUpdateRequestDto; documentFile?: Express.Multer.File}): Promise<HostEntity> {
        try {
            const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(hostId);

            validateAllowedToUpdateHost(existingUser);

            let hostDocumentUrl: string | undefined;

            if (documentFile){
                hostDocumentUrl = await uploadToCloudinary({
                    fileBuffer: documentFile.buffer,
                    folderPath: 'host-documents',
                    fileType: 'image',
                });

                console.log('new hostDocumentUrl:', hostDocumentUrl);

                if (existingUser.certificateUrl && existingUser.certificateUrl.trim() !== '') {
                    try {
                        await deleteFromCloudinary({fileUrl: existingUser.certificateUrl, resourceType: 'image'});
                    } catch (cleanupErr) {
                        console.warn("Failed to delete host document from Cloudinary:", cleanupErr);
                    }
                }
            }

            const hostUpdateInput: HostUpdateInput = mapHostDetailsUpdateToInput(updateDto, hostDocumentUrl);

            const hostEntity: HostEntity | null = await this._userRepository.updateHostDetails(hostId, hostUpdateInput);

            if (!hostEntity) {
                throw new Error("Failed to update host details. User not found."); 
            }

            return hostEntity;

        } catch (error: unknown) {
            throw error;
        }
    }


    async updateHostLogoByHost({ hostId, logoFile }: { hostId: string; logoFile?: Express.Multer.File }): Promise<UserProfileEntity> {
        let newOrganizationLogoUrl: string | undefined;

        try {
            const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(hostId);

            validateAllowedToUpdateHost(existingUser);

            if (!logoFile) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Organization logo is required.");
            }

            newOrganizationLogoUrl = await uploadToCloudinary({
                fileBuffer: logoFile.buffer,
                folderPath: 'host-logos',
                fileType: 'image',
            });

            // Note: If changing the logo requires the host to be re-verified by an admin, 
            // you must also pass `hostStatus: HOST_STATUS.PENDING` in this update payload.
            const updatedEntity: UserProfileEntity | null = await this._userRepository.updateHostDetails(hostId, { 
                organizationLogo: newOrganizationLogoUrl 
            });

            if (!updatedEntity) {
                throw new Error("Failed to update organization logo in the database."); 
            }

            // DB update successful: Safely delete the old logo
            if (existingUser.organizationLogo) {
                await deleteFromCloudinary({ fileUrl: existingUser.organizationLogo, resourceType: 'image' }).catch((err) => {
                    console.warn("Failed to delete old organization logo from Cloudinary:", err);
                });
            }

            return updatedEntity;

        } catch (error: unknown) {
            // ROLLBACK: If the DB update failed, delete the newly uploaded file to prevent storage leaks
            if (newOrganizationLogoUrl) {
                await deleteFromCloudinary({ fileUrl: newOrganizationLogoUrl, resourceType: 'image' }).catch((err) => {
                    console.error("Rollback failed: Could not delete orphaned logo from Cloudinary:", err);
                });
            }
            throw error;
        }
    }


    async updateHostLogoByAdmin({ hostId, logoFile }: { hostId: string; logoFile?: Express.Multer.File }): Promise<UserProfileEntity> {
        let newOrganizationLogoUrl: string | undefined;

        try {
            const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(hostId);

            if (!existingUser) {
                throw createHttpError(HTTP_STATUS.NOT_FOUND, HOST_MESSAGES.HOST_NOT_FOUND);
            }

            if (existingUser.role !== USER_ROLES.HOST) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, HOST_MESSAGES.USER_NOT_A_HOST);
            }

            if (!logoFile) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Organization logo is required.");
            }

            newOrganizationLogoUrl = await uploadToCloudinary({
                fileBuffer: logoFile.buffer,
                folderPath: 'host-logos',
                fileType: 'image',
            });


            const updatePayload: HostUpdateInput = mapAdminHostLogoUpdateToInput(newOrganizationLogoUrl);

            const updatedEntity: UserProfileEntity | null = await this._userRepository.updateHostDetails(hostId, updatePayload);

            if (!updatedEntity) {
                throw new Error("Failed to update organization logo in the database."); 
            }

            if (existingUser.organizationLogo) {
                await deleteFromCloudinary({ fileUrl: existingUser.organizationLogo, resourceType: 'image' }).catch((err) => {
                    console.warn(`Failed to delete old organization logo [${existingUser.organizationLogo}] from Cloudinary:`, err);
                });
            }

            return updatedEntity;

        } catch (error: unknown) {
            // ROLLBACK: Delete newly uploaded image if database transaction fails
            if (newOrganizationLogoUrl) {
                await deleteFromCloudinary({ fileUrl: newOrganizationLogoUrl, resourceType: 'image' }).catch((err) => {
                    console.error("Rollback failed: Could not delete orphaned logo from Cloudinary:", err);
                });
            }
            throw error;
        }
    }


    async updateHostDetailsByAdmin({hostId, updateDto, documentFile}: {
        hostId: string;
        updateDto: HostUpdateRequestDto;
        documentFile?: Express.Multer.File;
    }): Promise<HostEntity> {
        try {
            const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(hostId);

            if (!existingUser) {
                throw createHttpError(HTTP_STATUS.NOT_FOUND, HOST_MESSAGES.HOST_NOT_FOUND);
            }

            const isHost = existingUser.role === USER_ROLES.HOST;

            if (!isHost) {
                throw createHttpError(HTTP_STATUS.NOT_FOUND, HOST_MESSAGES.USER_NOT_A_HOST);
            }

            // may check the validations
            // const allowedToEdit = isHost || (
            //     existingUser.hostStatus === HostStatus.REJECTED || 
            //     existingUser.hostStatus === HostStatus.BLOCKED ||
            //     existingUser.hostStatus === HostStatus.APPROVED
            // );

            let hostDocumentUrl: string | undefined;

            if (documentFile){
                hostDocumentUrl = await uploadToCloudinary({
                    fileBuffer: documentFile.buffer,
                    folderPath: 'host-documents',
                    fileType: 'image',
                });

                console.log('new hostDocumentUrl:', hostDocumentUrl);

                if (existingUser.certificateUrl && existingUser.certificateUrl.trim() !== '') {
                    try {
                        await deleteFromCloudinary({fileUrl: existingUser.certificateUrl, resourceType: 'image'});
                    } catch (cleanupErr) {
                        console.warn("Failed to delete host document from Cloudinary:", cleanupErr);
                    }
                }
            }

            const hostUpdateInput: HostUpdateInput = mapAdminHostDetailsUpdateToInput(updateDto, hostDocumentUrl);

            const hostEntity: HostEntity | null = await this._userRepository.updateHostDetails(hostId, hostUpdateInput);

            if (!hostEntity) {
                throw new Error("Failed to update host details. User not found."); 
            }

            return hostEntity;

        } catch (error: unknown) {
            throw error;
        }
    }


    
    async getAllHosts(filters: GetHostsFilter): Promise<GetHostsResult> {
        try {
            const { page, limit, search, role, status, hostStatus } = filters;
            console.log('Filters received in HostManagementServices.getAllHosts:', filters);

            const query: UserFilterQuery = {};

            query.role = role ?? USER_ROLES.HOST;

            if (search) {
                query.$or = [
                    { organizationName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { mobile: { $regex: search, $options: 'i' } },
                ];
            }

            if (status) query.status = status;
            if (hostStatus) query.hostStatus = hostStatus;

            const skip = (page - 1) * limit;

            console.log('Final query in HostManagementServices.getAllHosts:', query);

            const [hosts, totalCount]: [UserEntity[] | null, number] = await Promise.all([
                this._userRepository.findHosts(query, skip, limit),
                this._userRepository.countUsers(query)
            ]);

            const mappedHosts: UserProfileResponseDto[] = hosts ? hosts.map(mapUserEntityToProfileDto) : [];

            return {
                hosts: mappedHosts,
                pagination: {
                    totalCount: totalCount,
                    limit: limit,
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit)
                },
            };

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in HostManagementServices.getAllHosts:', msg);
            throw error;
        }
    }


    async getOrganiserProfile(hostId: string): Promise<OrganiserProfileResponseDTO> {
        const host = await this._userRepository.getHostById(hostId);
        if (!host || host.role !== USER_ROLES.HOST) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, "Organiser not found.");
        }

        return mapToOrganiserProfileDTO(host);
    }


}