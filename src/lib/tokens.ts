import { EntityType } from './types';

export const MONK_MANAGER_TOKEN = 'MONK_MANAGER';
export const MONK_DATABASE_TOKEN = 'MONK_DATABASE';
export const MONK_OPTIONS_TOKEN = 'MONK_OPTIONS';

export function createMonkCollectionToken(type: EntityType<any>) {
  return `COLLECTION_${type.name}`.toLocaleUpperCase();
}

export function createMonkRepositoryToken(type: EntityType<any>) {
  return `REPOSITORY_${type.name}`.toLocaleUpperCase();
}
