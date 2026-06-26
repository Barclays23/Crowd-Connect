// backend/src/services/host-servies/implementations/hostManagement.service.ts
import { IUserRepository } from "@/repositories/interfaces/IUserRepository";
import { 
    HostManageRequestDto, 
    HostStatusUpdateResponseDto, 
    HostUpgradeRequestDto, 
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
    mapUpdateHostDTOToInput, 
} from "@/mappers/user.mapper";
import { HOST_STATUS, HostStatus, USER_ROLES, UserRole } from "@/constants/user-system.constants";
import { GetHostsFilter, GetHostsResult, UserFilterQuery } from "@/types/user.types";
import { IHostManagementServices } from "../interfaces/IHostManagementServices";
import { HOST_MESSAGES, USER_MESSAGES } from "@/constants/messages.constants";




export class HostManagementServices implements IHostManagementServices {
    constructor(
        private _userRepository: IUserRepository,
    ) {}

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
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            };

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in HostManagementServices.getAllHosts:', msg);
            throw error;
        }
    }


    async applyHostUpgrade({ userId, upgradeDto, documentFile }: {
        userId: string;
        upgradeDto: HostUpgradeRequestDto;
        documentFile: Express.Multer.File;
    }): Promise<UserProfileResponseDto> {
        try {
            console.log("✅✅✅✅✅ received data in HostManagementServices.applyHostUpgrade ----");
            console.log("userId:", userId);
            console.log("upgradeDto:", upgradeDto);
            console.log("fileName:", documentFile?.originalname);

            const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(userId);

            if (!existingUser) {
                throw createHttpError(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);
            }

            const isAlreadyHost = isHost(existingUser);
            const isUser = existingUser.role === USER_ROLES.USER;

            const allowedToApply = isUser || (isAlreadyHost && existingUser?.hostStatus === HOST_STATUS.REJECTED);

            if (!allowedToApply) {
                if (isAlreadyHost) {
                    const status = existingUser.hostStatus;
                    if (status === HOST_STATUS.APPROVED) throw createHttpError(HTTP_STATUS.BAD_REQUEST, HOST_MESSAGES.HOST_ALREADY_APPROVED);
                    if (status === HOST_STATUS.PENDING) throw createHttpError(HTTP_STATUS.BAD_REQUEST, HOST_MESSAGES.HOST_APPLICATION_PENDING);
                    if (status === HOST_STATUS.BLOCKED) throw createHttpError(HTTP_STATUS.FORBIDDEN, HOST_MESSAGES.HOST_BLOCKED);
                }
            }

            let hostDocumentUrl: string | undefined;

            // if (!documentFile){
            //     throw createHttpError(HTTP_STATUS.BAD_REQUEST, 'File is not attached for upgrading.')
            // }


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

            const upgradeInput: UpgradeHostInput = mapHostUpgradeRequestDtoToInput({upgradeDto, hostDocumentUrl});

            const hostEntity: HostEntity | null = await this._userRepository.updateHostDetails(userId, upgradeInput);

            if (!hostEntity) {
                throw new Error("Failed to update host details. User not found."); 
            }

            const hostProfile: UserProfileResponseDto = mapUserEntityToProfileDto(hostEntity);

            console.log('hostProfile after applyHostUpgrade:', hostProfile);

            return hostProfile;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in HostManagementServices.applyHostUpgrade:', msg);
            throw error;
        }
    }


    async manageHostStatus({ hostId, action, reason }: HostManageRequestDto): Promise<HostStatusUpdateResponseDto> {
        try {
            const hostEntity: HostEntity | null = await this._userRepository.getHostById(hostId);
            if (!hostEntity) {
                throw createHttpError(HTTP_STATUS.NOT_FOUND, HOST_MESSAGES.HOST_NOT_FOUND);
            }

            const allowedTransitions: Record<HostStatus, Array<'approve' | 'reject' | 'block'>> = {
                [HOST_STATUS.PENDING]: ['approve', 'reject', 'block'],
                [HOST_STATUS.APPROVED]: ['block'],
                [HOST_STATUS.REJECTED]: ['block'],
                [HOST_STATUS.BLOCKED]: [],  // Can unblock → changes to PENDING
            } as const;

            const allowedActions = allowedTransitions[hostEntity.hostStatus as HostStatus];

            if (!allowedActions.includes(action)) {
                throw createHttpError(
                    HTTP_STATUS.BAD_REQUEST,
                    `Cannot ${action} a host in ${hostEntity.hostStatus} state.`
                    // `Cannot ${action} a ${hostEntity.hostStatus} host.`
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
            console.error('Error in HostManagementServices.manageHostStatus:', msg);
            throw error;
        }
    }


    async updateHostByAdmin({hostId, updateDto, documentFile}: {
        hostId: string;
        updateDto: HostUpgradeRequestDto;
        documentFile: Express.Multer.File | undefined;
    }): Promise<UserProfileResponseDto> {
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

            const isDoneByAdmin = true;

            const hostUpdateInput: HostUpdateInput = mapUpdateHostDTOToInput({isDoneByAdmin, updateDto, hostDocumentUrl});

            const hostEntity: HostEntity | null = await this._userRepository.updateHostDetails(hostId, hostUpdateInput);

            if (!hostEntity) {
                throw new Error("Failed to update host details. User not found."); 
            }

            const hostProfile: UserProfileResponseDto = mapUserEntityToProfileDto(hostEntity);

            console.log('hostProfile after updateHostByAdmin:', hostProfile);

            return hostProfile;

        } catch (error: unknown) {
            throw error;
        }
    }


}