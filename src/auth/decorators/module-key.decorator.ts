import { SetMetadata } from '@nestjs/common';

export const MODULE_KEY_METADATA = 'moduleKey';
export const ModuleKey = (key: string) => SetMetadata(MODULE_KEY_METADATA, key);
