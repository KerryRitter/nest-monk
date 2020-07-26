import { Type } from '@nestjs/common';

export const MONK_MANAGER_TOKEN = 'MONK_MANAGER';
export const MONK_DATABASE_TOKEN = 'MONK_DATABASE';
export const MONK_OPTIONS_TOKEN = 'MONK_OPTIONS';

export function createMonkCollectionToken(type: Type<any>) {
  return `COLLECTION_${type.name}`.toLocaleUpperCase();
}
