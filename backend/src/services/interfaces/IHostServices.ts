import { GetHostsFilter, GetHostsResult } from "../../types/user.types";
import { 
    HostManageRequestDto,
    HostStatusUpdateResponseDto, 
    HostUpgradeRequestDto, 
    UserProfileResponseDto 
} from "../../dtos/user.dto";




export interface IHostServices {
    applyHostUpgrade({ userId, upgradeDto, documentFile }: {
        userId: string;
        upgradeDto: HostUpgradeRequestDto;
        documentFile: Express.Multer.File | undefined;
    }): Promise<UserProfileResponseDto>;

    manageHostStatus({ hostId, action, reason }: HostManageRequestDto): Promise<HostStatusUpdateResponseDto>;


    getAllHosts(filters: GetHostsFilter): Promise<GetHostsResult>;

}