import { Inject, Type } from '@nestjs/common';
import { createMonkCollectionToken, createMonkRepositoryToken } from './tokens';

export function InjectCollection(type: Type<any>) {
  return Inject(createMonkCollectionToken(type));
}

export function InjectRepository(type: Type<any>) {
  return Inject(createMonkRepositoryToken(type));
}
