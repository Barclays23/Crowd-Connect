// backend/src/services/host/implementations/hostManagement.services.ts

import { IUserRepository } from "../../../repositories/interfaces/IUserRepository.js";
import { HostManageRequestDto, HostStatusUpdateResponseDto, HostUpgradeRequestDto, UserProfileResponseDto } from "../../../dtos/user.dto.js";
import { createHttpError } from "../../../utils/httpError.utils.js";
import { HttpStatus } from "../../../constants/statusCodes.constants.js";
import { HttpResponse } from "../../../constants/responseMessages.constants.js";
import { HostEntity, HostManageInput, HostUpdateInput, UpgradeHostInput, UserEntity, UserProfileEntity } from "../../../entities/user.entity.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../../../config/cloudinary.js";
import { isHost } from "../../../utils/general.utils.js";
import { 
    mapToHostManageInput,
    mapHostUpgradeRequestDtoToInput, 
    mapUserEntityToProfileDto,
    mapToHostStatusUpdateResponseDto,
    mapUpdateHostDTOToInput, 
} from "../../../mappers/user.mapper.js";
import { HostStatus, UserRole } from "../../../constants/roles-and-statuses.js";
import { GetHostsFilter, GetHostsResult, UserFilterQuery } from "../../../types/user.types.js";
import { IHostManagementServices } from "../host-interfaces/IHostManagementServices.js";




export class HostManagementServices implements IHostManagementServices {
    constructor(
        private _userRepository: IUserRepository,
    ) {}

    async getAllHosts(filters: GetHostsFilter): Promise<GetHostsResult> {
        try {
            const { page, limit, search, role, status, hostStatus } = filters;
            console.log('Filters received in HostManagementServices.getAllHosts:', filters);

            const query: UserFilterQuery = {};

            query.role = role ?? UserRole.HOST;

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
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
            }

            const isAlreadyHost = isHost(existingUser);
            const isUser = existingUser.role === UserRole.USER;

            const allowedToApply = isUser || (isAlreadyHost && existingUser?.hostStatus === HostStatus.REJECTED);

            if (!allowedToApply) {
                if (isAlreadyHost) {
                    const status = existingUser.hostStatus;
                    if (status === HostStatus.APPROVED) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.HOST_ALREADY_APPROVED);
                    if (status === HostStatus.PENDING) throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.HOST_APPLICATION_PENDING);
                    if (status === HostStatus.BLOCKED) throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.HOST_BLOCKED);
                }
            }

            let hostDocumentUrl: string | undefined;

            // if (!documentFile){
            //     throw createHttpError(HttpStatus.BAD_REQUEST, 'File is not attached for upgrading.')
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

            const hostEntity: HostEntity = await this._userRepository.updateHostDetails(userId, upgradeInput);

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
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.HOST_NOT_FOUND);
            }


            const allowedTransitions: Record<HostStatus, Array<'approve' | 'reject' | 'block'>> = {
                [HostStatus.PENDING]: ['approve', 'reject', 'block'],
                [HostStatus.APPROVED]: ['block'],
                [HostStatus.REJECTED]: ['block'],
                [HostStatus.BLOCKED]: [],  // Can unblock → changes to PENDING
            } as const;

            const allowedActions = allowedTransitions[hostEntity.hostStatus as HostStatus];


            if (!allowedActions.includes(action)) {
                throw createHttpError(
                    HttpStatus.BAD_REQUEST,
                    `Cannot ${action} a host in ${hostEntity.hostStatus} state.`
                    // `Cannot ${action} a ${hostEntity.hostStatus} host.`
                );
            }

            const hostStatusInput: HostManageInput = mapToHostManageInput({hostId, action, reason});
            
            const updatedHostEntity: HostEntity = await this._userRepository.updateHostStatus(hostId, hostStatusInput);

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
            console.log("✅✅✅✅✅ received data in HostManagementServices.updateHostByAdmin ----");
            console.log("userId:", hostId);
            console.log("upgradeDto:", updateDto);
            console.log("fileName:", documentFile?.originalname);

            const existingUser: UserProfileEntity | null = await this._userRepository.getUserProfile(hostId);

            if (!existingUser) {
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.HOST_NOT_FOUND);
            }

            const isHost = existingUser.role === UserRole.HOST;

            if (!existingUser) {
                throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_A_HOST);
            }

            // may check any validations
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

            const hostEntity: HostEntity = await this._userRepository.updateHostDetails(hostId, hostUpdateInput);

            const hostProfile: UserProfileResponseDto = mapUserEntityToProfileDto(hostEntity);

            console.log('hostProfile after updateHostByAdmin:', hostProfile);

            return hostProfile;

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in HostManagementServices.updateHostByAdmin:', msg);
            throw error;
        }
    }


}