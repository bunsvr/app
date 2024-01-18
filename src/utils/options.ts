/**
 * JSON response options
 */
export const json = {
    headers: { 'Content-Type': 'application/json' }
} satisfies ResponseInit;

/**
 * HTML response options
 */
export const html = {
    headers: { 'Content-Type': 'text/html' }
} satisfies ResponseInit;

/**
 * Event stream options
 */
export const events = {
    headers: { 'Content-Type': 'text/event-stream' }
} satisfies ResponseInit;

/**
 * Status responses
 */
export const status: ResponseInit[] = new Array(1000);
for (let i = 0; i < 1000; ++i) status[i] = { status: i };
