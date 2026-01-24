// backend/src/utils/general.utils.ts

import { HostEntity, UserEntity } from "../entities/user.entity.js";


export function isHost(entity: UserEntity | HostEntity): entity is HostEntity {
  return (entity as HostEntity).hostStatus !== undefined;
}