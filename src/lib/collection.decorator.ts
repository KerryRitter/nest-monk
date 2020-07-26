import { Inject } from '@nestjs/common';
import { createMonkCollectionToken } from './tokens';

export function InjectCollection(collectionName: string) {
  return Inject(createMonkCollectionToken(collectionName));
}
