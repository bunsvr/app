import { ResponseOptions } from './types';

/**
 * JSON response options
 */
export const json: ResponseOptions = {
    headers: { 'Content-Type': 'application/json' }
};

/**
 * HTML response options
 */
export const html: ResponseOptions = {
    headers: { 'Content-Type': 'text/html' }
};

/**
 * Event stream options
 */
export const events = {
    headers: {
        'Content-Type': 'text/event-stream'
    }
}

/**
 * Status responses
 */
export const status = new Array<ResponseOptions>(1000);
for (var i = 0; i < 1000; ++i) status[i] = { status: i };
