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
import { 
    validateAllowedToApplyRoleUpgrade, 
    validateAllowedToUpdateHost 
} from "@/utils/validations/userValidations";
import { INotificationService } from "@/services/notification-services/interfaces/INotificationService";
import { NOTIFICATION_RECIPIENT_ROLES, NOTIFICATION_TYPES } from "@/types/notification.types";
import { IFileStorageService } from "@/services/file-storage-services/interfaces/IFileStorageService";




export class HostManagementService implements IHostManagementServices {
    constructor(
        private readonly _userRepository: IUserRepository,
        private readonly _notificationDispatcher: INotificationService,
        private readonly _storageService: IFileStorageService
    ) {}


    async applyHostRoleUpgrade({ userId, upgradeDto, documentFile, logoFile }: {
        userId: string;
        upgradeDto: HostUpgradeRequestDto;
        documentFile: Express.Multer.File;
        logoFile: Express.Multer.File;
    }): Promise<UserProfileResponseDto> {
        const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(userId);

        validateAllowedToApplyRoleUpgrade(existingUser);

        let hostDocumentUrl: string | undefined;
        let organizationLogoUrl: string | undefined;

        // Handle Document Upload
        if (documentFile){
            hostDocumentUrl = await this._storageService.uploadFile(documentFile.buffer, 'host-documents', 'image');

            if (existingUser.certificateUrl && existingUser.certificateUrl.trim() !== '') {
                try {
                    await this._storageService.deleteFile(existingUser.certificateUrl, 'image');

                } catch (cleanupErr) {
                    console.warn("Failed to delete old host document from storage:", cleanupErr);
                }
            }
        }

        // Handle Logo Upload
        if (logoFile) {
            organizationLogoUrl = await this._storageService.uploadFile(logoFile.buffer, 'host-logos', 'image');

            if (existingUser.organizationLogo) {
                await this._storageService.deleteFile(existingUser.organizationLogo, 'image').catch(() => {});
            }
        }

        const upgradeInput: UpgradeHostInput = mapHostUpgradeRequestDtoToInput({upgradeDto, hostDocumentUrl, organizationLogoUrl});

        const hostEntity: HostEntity | null = await this._userRepository.updateHostDetails(userId, upgradeInput);

        if (!hostEntity) {
            throw new Error("Failed to update host details. User not found."); 
        }

        // NOTIFICATION: Notify the Admin that a new request send by user.
        const systemAdminId = process.env.SUPER_ADMIN_ID;
        if (systemAdminId) {
            await this._notificationDispatcher.notify({
                type: NOTIFICATION_TYPES.HOST_REQUEST_RECEIVED,
                recipient: { userId: systemAdminId, role: NOTIFICATION_RECIPIENT_ROLES.ADMIN },
                data: { organizationName: upgradeInput.organizationName, applicantEmail: hostEntity.email }
            });
        }

        return mapUserEntityToProfileDto(hostEntity);

    }


    async manageHostApplication({ hostId, action, reason }: HostManageApplicationDto): Promise<HostStatusUpdateResponseDto> {
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

        // NOTIFICATION: Inform host of application result
        const notificationType = action === "approve" 
            ? NOTIFICATION_TYPES.HOST_REQUEST_APPROVED 
            : NOTIFICATION_TYPES.HOST_REQUEST_REJECTED;

        await this._notificationDispatcher.notify({
            type: notificationType,
            recipient: { userId: hostEntity.userId, role: NOTIFICATION_RECIPIENT_ROLES.USER, email: hostEntity.email },
            data: { reason: reason || "" }
        });

        return updatedStatusResponse;
    }


    async manageHostPermission({ hostId, action, reason }: HostManagePermissionDto): Promise<HostStatusUpdateResponseDto> {
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

        // NOTIFICATION: Host blocked/unblocked
        const notificationType = action === "block" 
            ? NOTIFICATION_TYPES.ACCOUNT_BLOCKED 
            : NOTIFICATION_TYPES.ACCOUNT_UNBLOCKED;

        await this._notificationDispatcher.notify({
            type: notificationType,
            recipient: { userId: hostEntity.userId, role: NOTIFICATION_RECIPIENT_ROLES.HOST, email: hostEntity.email },
            data: { reason: reason || "" }
        });

        return updatedStatusResponse;
    }


    async convertToHost({ userId, upgradeDto, documentFile, logoFile }: {
        userId: string;
        upgradeDto: HostUpgradeRequestDto;
        documentFile?: Express.Multer.File;
        logoFile?: Express.Multer.File;
    }): Promise<UserProfileResponseDto> {
        let hostDocumentUrl: string | undefined;
        let organizationLogoUrl: string | undefined;

        try {
            const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(userId);
            if (!existingUser) throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);

            if (documentFile) {
                hostDocumentUrl = await this._storageService.uploadFile(documentFile.buffer, 'host-documents', 'image');
            }
            if (logoFile) {
                organizationLogoUrl = await this._storageService.uploadFile(logoFile.buffer, 'host-logos', 'image');
            }

            const upgradeInput: UpgradeHostInput = mapHostUpgradeRequestDtoToInput({upgradeDto, hostDocumentUrl, organizationLogoUrl});
            
            // upgradeInput.hostStatus = HOST_STATUS.APPROVED;  // can approve later (or here if need)
            
            const hostEntity: UserProfileEntity | null = await this._userRepository.updateHostDetails(userId, upgradeInput);
            if (!hostEntity) throw new Error("Failed to convert user to host."); 

            return mapUserEntityToProfileDto(hostEntity);

        } catch (error: unknown) {
            if (hostDocumentUrl) {
                await this._storageService.deleteFile(hostDocumentUrl, 'image').catch((err) => {
                    console.error("Rollback failed: Could not delete orphaned document from storage:", err);
                });
            }
            if (organizationLogoUrl) {
                await this._storageService.deleteFile(organizationLogoUrl, 'image').catch((err) => {
                    console.error("Rollback failed: Could not delete orphaned logo from storage:", err);
                });
            }
            throw error;
        }
    }


    async updateHostDetailsByHost({hostId, updateDto, documentFile}: {hostId: string; updateDto: HostUpdateRequestDto; documentFile?: Express.Multer.File}): Promise<UserProfileResponseDto> {
        const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(hostId);

        validateAllowedToUpdateHost(existingUser);

        let hostDocumentUrl: string | undefined;

        if (documentFile){
            hostDocumentUrl = await this._storageService.uploadFile(documentFile.buffer, 'host-documents', 'image');

            if (existingUser.certificateUrl && existingUser.certificateUrl.trim() !== '') {
                try {
                    await this._storageService.deleteFile(existingUser.certificateUrl, 'image');

                } catch (cleanupErr) {
                    console.warn("Failed to delete host document from storage:", cleanupErr);
                }
            }
        }

        const hostUpdateInput: HostUpdateInput = mapHostDetailsUpdateToInput(updateDto, hostDocumentUrl);

        const hostEntity: HostEntity | null = await this._userRepository.updateHostDetails(hostId, hostUpdateInput);

        if (!hostEntity) {
            throw new Error("Failed to update host details. User not found."); 
        }

        return mapUserEntityToProfileDto(hostEntity);
    }


    async updateHostLogoByHost({ hostId, logoFile }: { hostId: string; logoFile?: Express.Multer.File }): Promise<UserProfileResponseDto> {
        let newOrganizationLogoUrl: string | undefined;

        try {
            const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(hostId);

            validateAllowedToUpdateHost(existingUser);

            if (!logoFile) {
                throw createHttpError(HTTP_STATUS.BAD_REQUEST, "Organization logo is required.");
            }

            newOrganizationLogoUrl = await this._storageService.uploadFile(logoFile.buffer, 'host-logos', 'image');

            // Note: If changing the logo requires the host to be re-verified by an admin, 
            // must also pass `hostStatus: HOST_STATUS.PENDING` in this update payload.
            const updatedEntity: UserProfileEntity | null = await this._userRepository.updateHostDetails(hostId, { 
                organizationLogo: newOrganizationLogoUrl 
            });

            if (!updatedEntity) {
                throw new Error("Failed to update organization logo in the database."); 
            }

            if (existingUser.organizationLogo) {
                await this._storageService.deleteFile(existingUser.organizationLogo, 'image').catch((err) => {
                    console.warn("Failed to delete old organization logo from storage:", err);
                });
            }

            return mapUserEntityToProfileDto(updatedEntity);

        } catch (error: unknown) {
            // ROLLBACK: If the DB update failed, delete the newly uploaded file to prevent storage leaks
            if (newOrganizationLogoUrl) {
                await this._storageService.deleteFile(newOrganizationLogoUrl, 'image').catch((err) => {
                    console.error("Rollback failed: Could not delete orphaned logo from storage:", err);
                });
            }
            throw error;
        }
    }


    async updateHostLogoByAdmin({ hostId, logoFile }: { hostId: string; logoFile?: Express.Multer.File }): Promise<UserProfileResponseDto> {
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

            newOrganizationLogoUrl = await this._storageService.uploadFile(logoFile.buffer, 'host-logos', 'image');

            const updatePayload: HostUpdateInput = mapAdminHostLogoUpdateToInput(newOrganizationLogoUrl);

            const updatedEntity: UserProfileEntity | null = await this._userRepository.updateHostDetails(hostId, updatePayload);

            if (!updatedEntity) {
                throw new Error("Failed to update organization logo in the database."); 
            }

            if (existingUser.organizationLogo) {
                await this._storageService.deleteFile(existingUser.organizationLogo, 'image').catch((err) => {
                    console.warn(`Failed to delete old organization logo from storage:`, err);
                });
            }

            return mapUserEntityToProfileDto(updatedEntity);

        } catch (error: unknown) {
            // ROLLBACK: Delete newly uploaded image if database transaction fails
            if (newOrganizationLogoUrl) {
                await this._storageService.deleteFile(newOrganizationLogoUrl, 'image').catch((err) => {
                    console.error("Rollback failed: Could not delete orphaned logo from storage:", err);
                });
            }
            throw error;
        }
    }


    async updateHostDetailsByAdmin({hostId, updateDto, documentFile}: {
        hostId: string;
        updateDto: HostUpdateRequestDto;
        documentFile?: Express.Multer.File;
    }): Promise<UserProfileResponseDto> {
        const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(hostId);

        if (!existingUser) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, HOST_MESSAGES.HOST_NOT_FOUND);
        }

        const isHost = existingUser.role === USER_ROLES.HOST;

        if (!isHost) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, HOST_MESSAGES.USER_NOT_A_HOST);
        }

        let hostDocumentUrl: string | undefined;

        if (documentFile){
            hostDocumentUrl = await this._storageService.uploadFile(documentFile.buffer, 'host-documents', 'image');

            if (existingUser.certificateUrl && existingUser.certificateUrl.trim() !== '') {
                try {
                    await this._storageService.deleteFile(existingUser.certificateUrl, 'image');
                } catch (cleanupErr) {
                    console.warn("Failed to delete host document from storage:", cleanupErr);
                }
            }
        }

        const hostUpdateInput: HostUpdateInput = mapAdminHostDetailsUpdateToInput(updateDto, hostDocumentUrl);

        const hostEntity: HostEntity | null = await this._userRepository.updateHostDetails(hostId, hostUpdateInput);

        if (!hostEntity) {
            throw new Error("Failed to update host details. User not found."); 
        }

        return mapUserEntityToProfileDto(hostEntity);
    }


    
    async getAllHosts(filters: GetHostsFilter): Promise<GetHostsResult> {
        const { page, limit, search, role, status, hostStatus } = filters;

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
    }


    async getOrganiserProfile(hostId: string): Promise<OrganiserProfileResponseDTO> {
        const host = await this._userRepository.getHostById(hostId);
        if (!host || host.role !== USER_ROLES.HOST) {
            throw createHttpError(HTTP_STATUS.NOT_FOUND, HOST_MESSAGES.ORGANIZER_NOT_FOUND);
        }

        return mapToOrganiserProfileDTO(host);
    }


}