import { Inject, Type } from '@nestjs/common';
import { createMonkCollectionToken } from './tokens';

export function InjectCollection(type: Type<any>) {
  return Inject(createMonkCollectionToken(type));
}
