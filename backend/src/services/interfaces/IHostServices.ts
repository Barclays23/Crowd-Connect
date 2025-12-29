import { HostUpgradeDTO, UserProfileDto } from "../../dtos/user.dto";




export interface IHostServices {
    applyHostUpgrade({ userId, upgradeDto, documentFile }: {
        userId: string;
        upgradeDto: HostUpgradeDTO;
        documentFile: Express.Multer.File | undefined;
    }): Promise<UserProfileDto>;

}