// backend/src/services/host/interfaces/IHostManagementServices.ts

import { GetHostsFilter, GetHostsResult } from "@/types/user.types";
import { 
    HostManageRequestDto,
    HostStatusUpdateResponseDto, 
    HostUpdateRequestDto, 
    HostUpgradeRequestDto, 
    OrganiserProfileResponseDTO, 
    UserProfileResponseDto 
} from "@/dtos/user.dto";




export interface IHostManagementServices {
    applyHostUpgrade({ userId, upgradeDto, documentFile, logoFile }: {
        userId: string;
        upgradeDto: HostUpgradeRequestDto;
        documentFile: Express.Multer.File | undefined;
        logoFile: Express.Multer.File | undefined;
    }): Promise<UserProfileResponseDto>;

    getAllHosts(filters: GetHostsFilter): Promise<GetHostsResult>;
    
    manageHostStatus({ hostId, action, reason }: HostManageRequestDto): Promise<HostStatusUpdateResponseDto>;
    
    updateHostByAdmin({hostId, updateDto, documentFile}: {
        hostId: string;
        updateDto: HostUpgradeRequestDto;
        documentFile: Express.Multer.File | undefined;
    }): Promise<UserProfileResponseDto>;

    updateHostDetailsByHost({hostId, updateDto}: {
        hostId: string;
        updateDto: HostUpdateRequestDto;
    }): Promise<UserProfileResponseDto>;

    updateHostLogoByHost({hostId, logoFile}: {
        hostId: string;
        logoFile: Express.Multer.File | undefined;
    }): Promise<UserProfileResponseDto>;

    getOrganiserProfile(hostId: string): Promise<OrganiserProfileResponseDTO>

}