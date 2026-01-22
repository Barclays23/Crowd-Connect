// backend/src/services/host/interfaces/IHostManagementServices.ts

import { GetHostsFilter, GetHostsResult } from "../../../types/user.types";
import { 
    HostManageRequestDto,
    HostStatusUpdateResponseDto, 
    HostUpgradeRequestDto, 
    UserProfileResponseDto 
} from "../../../dtos/user.dto";




export interface IHostManagementServices {
    applyHostUpgrade({ userId, upgradeDto, documentFile }: {
        userId: string;
        upgradeDto: HostUpgradeRequestDto;
        documentFile: Express.Multer.File | undefined;
    }): Promise<UserProfileResponseDto>;

    getAllHosts(filters: GetHostsFilter): Promise<GetHostsResult>;
    
    manageHostStatus({ hostId, action, reason }: HostManageRequestDto): Promise<HostStatusUpdateResponseDto>;
    
    updateHostByAdmin({hostId, updateDto, documentFile}: {
        hostId: string;
        updateDto: HostUpgradeRequestDto;
        documentFile: Express.Multer.File | undefined;
    }): Promise<UserProfileResponseDto>;

}