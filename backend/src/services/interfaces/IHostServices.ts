import { GetHostsFilter, GetHostsResult } from "../../types/user.types";
import { HostUpgradeRequestDto, UserProfileResponseDto } from "../../dtos/user.dto";




export interface IHostServices {
    applyHostUpgrade({ userId, upgradeDto, documentFile }: {
        userId: string;
        upgradeDto: HostUpgradeRequestDto;
        documentFile: Express.Multer.File | undefined;
    }): Promise<UserProfileResponseDto>;

    getAllHosts(filters: GetHostsFilter): Promise<GetHostsResult>;

}