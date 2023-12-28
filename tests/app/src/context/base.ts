import { BaseConfig } from '@stricjs/app';
import { ctx } from '@stricjs/app/send';

export default {
    wraps: [ctx],
    prefix: '/ctx'
} as BaseConfig;
