import { Inject, Type } from '@nestjs/common';
import { createMonkCollectionToken, createMonkRepositoryToken } from './tokens';
import { EntityType, MonkEntityOptions } from './types';

export function InjectCollection<T>(type: EntityType<T>) {
  return Inject(createMonkCollectionToken(type));
}

export function InjectRepository<T>(type: EntityType<T>) {
  return Inject(createMonkRepositoryToken(type));
}

export function Entity<T>(options?: MonkEntityOptions<T>) {
  return function(target: EntityType<T>) {
    target.collectionOptions = options?.collectionOptions;
  }
}