// backend/src/utils/general.utils.ts

import { HostEntity, UserEntity } from "@/entities/user.entity";
import { GeoNearQueryOperator } from "@/types/event.types";


export function isHost(entity: UserEntity | HostEntity): entity is HostEntity {
  return (entity as HostEntity).hostStatus !== undefined;
}


export function isGeoNearQuery(location: unknown): location is GeoNearQueryOperator {
  return (
    location != null &&
    typeof location === 'object' &&
    '$near' in location
  );
}