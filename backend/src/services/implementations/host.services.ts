import { IUserRepository } from "../../repositories/interfaces/IUserRepository";
import { HostUpgradeRequestDto, UserProfileResponseDto } from "../../dtos/user.dto";
import { IHostServices } from "../interfaces/IHostServices";
import { createHttpError } from "../../utils/httpError.utils";
import { HttpStatus } from "../../constants/statusCodes";
import { HttpResponse } from "../../constants/responseMessages";
import { HostEntity, UpgradeHostInput, UserEntity, UserProfileEntity } from "../../entities/user.entity";
import { deleteFromCloudinary, uploadToCloudinary } from "../../config/cloudinary";
import { isHost } from "../../utils/general.utils";
import { 
    mapHostUpgradeRequestDtoToInput, 
    mapUserEntityToProfileDto, 
} from "../../mappers/user.mapper";
import { HostStatus, UserRole } from "../../constants/roles-and-statuses";
import { GetHostsFilter, GetHostsResult } from "../../types/user.types";




export class HostServices implements IHostServices {
    constructor(
        private _userRepository: IUserRepository,
    ) {}

    async applyHostUpgrade({ userId, upgradeDto, documentFile }: {
        userId: string;
        upgradeDto: HostUpgradeRequestDto;
        documentFile: Express.Multer.File;
    }): Promise<UserProfileResponseDto> {
        try {
            console.log("✅✅✅✅✅ received data in hostServices.applyHostUpgrade ----");
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


            if (documentFile){
                hostDocumentUrl = await uploadToCloudinary({
                    fileBuffer: documentFile.buffer,
                    folderPath: 'host-documents',
                    fileType: 'image',
                });

                console.log('new hostDocumentUrl:', hostDocumentUrl);

                // delete old document from cloudinary if needed
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
            // entity to userProfileDto if needed later
            // return hostdto
            console.log('hostProfile after updateHostDetails:', hostProfile);

            return hostProfile;

        } catch (error: any) {
            console.error('Error in hostServices.applyHostUpgrade:', error);
            throw error;
        }
    }


    async getAllHosts(filters: GetHostsFilter): Promise<GetHostsResult> {
        try {
            const { page, limit, search, role, status, hostStatus } = filters;
            console.log('Filters received in hostServices.getAllHosts:', filters);

            const query: any = {};

            query.role = role ? query.role = role : UserRole.HOST;

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

            console.log('Final query in hostServices.getAllHosts:', query);

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

        } catch (error: any) {
            console.error('Error in hostServices.getAllHosts:', error);
            throw error;
        }
    }

}