import { IUserRepository } from "../../repositories/interfaces/IUserRepository";
import { HostUpgradeRequestDto, UserProfileResponseDto } from "../../dtos/user.dto";
import { IHostServices } from "../interfaces/IHostServices";
import { createHttpError } from "../../utils/httpError.utils";
import { HttpStatus } from "../../constants/statusCodes";
import { HttpResponse } from "../../constants/responseMessages";
import { HostEntity, UpgradeHostInput, UserEntity, UserProfileEntity } from "../../entities/user.entity";
import { uploadToCloudinary } from "../../config/cloudinary";
import { isHost } from "../../utils/general.utils";
import { 
    mapHostUpgradeRequestDtoToInput, 
    mapUserEntityToProfileDto, 
} from "../../mappers/user.mapper";




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
            const isUser = existingUser.role === "user";

            const allowedToApply = isUser || (isAlreadyHost && existingUser?.hostStatus === "rejected");

            if (!allowedToApply) {
                if (isAlreadyHost) {
                    const status = existingUser.hostStatus;
                    if (status === "approved") throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.HOST_ALREADY_APPROVED);
                    if (status === "pending") throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.HOST_APPLICATION_PENDING);
                    if (status === "blocked") throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.HOST_BLOCKED);
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
            }

            const upgradeEntity: UpgradeHostInput = mapHostUpgradeRequestDtoToInput({upgradeDto, hostDocumentUrl});

            const hostEntity: HostEntity = await this._userRepository.updateHostDetails(userId, upgradeEntity);

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

}