// backend/src/services/host/interfaces/IHostManagementServices.ts

import { GetHostsFilter, GetHostsResult } from "@/types/user.types";
import { 
    HostManageApplicationDto,
    HostManagePermissionDto,
    HostStatusUpdateResponseDto, 
    HostUpdateRequestDto, 
    HostUpgradeRequestDto, 
    OrganiserProfileResponseDTO, 
    UserProfileResponseDto 
} from "@/dtos/user.dto";
import { HostEntity, UserProfileEntity } from "@/entities/user.entity";




export interface IHostManagementServices {
    applyHostRoleUpgrade({ userId, upgradeDto, documentFile, logoFile }: {
        userId: string;
        upgradeDto: HostUpgradeRequestDto;
        documentFile?: Express.Multer.File;
        logoFile?: Express.Multer.File;
    }): Promise<HostEntity>;

    convertToHost({ userId, upgradeDto, documentFile, logoFile }: {
        userId: string; upgradeDto: HostUpgradeRequestDto; documentFile?: Express.Multer.File; logoFile?: Express.Multer.File;
    }): Promise<UserProfileEntity>;
    
    manageHostApplication({ hostId, action, reason }: HostManageApplicationDto): Promise<HostStatusUpdateResponseDto>;
    manageHostPermission({ hostId, action, reason }: HostManagePermissionDto): Promise<HostStatusUpdateResponseDto>;
    
    
    updateHostDetailsByHost({hostId, updateDto, documentFile}: {hostId: string; updateDto: HostUpdateRequestDto; documentFile?: Express.Multer.File}): Promise<HostEntity>;
    
    updateHostLogoByHost({hostId, logoFile}: {hostId: string, logoFile?: Express.Multer.File}): Promise<UserProfileEntity>;
    
    updateHostDetailsByAdmin({hostId, updateDto, documentFile}: {hostId: string; updateDto: HostUpdateRequestDto; documentFile?: Express.Multer.File;}): Promise<HostEntity>;
    
    updateHostLogoByAdmin({ hostId, logoFile }: { hostId: string; logoFile?: Express.Multer.File }): Promise<UserProfileEntity>

    getAllHosts(filters: GetHostsFilter): Promise<GetHostsResult>;

    getOrganiserProfile(hostId: string): Promise<OrganiserProfileResponseDTO>

}