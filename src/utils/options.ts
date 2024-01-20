/**
 * JSON response options
 */
export const json = {
    headers: { 'Content-Type': 'application/json' }
} satisfies Bun.ResponseInit;

/**
 * HTML response options
 */
export const html = {
    headers: { 'Content-Type': 'text/html' }
} satisfies Bun.ResponseInit;

/**
 * Event stream options
 */
export const events = {
    headers: { 'Content-Type': 'text/event-stream' }
} satisfies Bun.ResponseInit;

/**
 * Status responses
 */
export const status: Bun.ResponseInit[] = new Array(1000);
for (let i = 0; i < 1000; ++i) status[i] = { status: i };
