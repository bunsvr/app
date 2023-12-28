/**
 * JSON response options
 */
export const json: ResponseInit = {
    headers: { 'Content-Type': 'application/json' }
};

/**
 * HTML response options
 */
export const html: ResponseInit = {
    headers: { 'Content-Type': 'text/html' }
};

/**
 * Event stream options
 */
export const events: ResponseInit = {
    headers: { 'Content-Type': 'text/event-stream' }
}

/**
 * Status responses
 */
export const status: ResponseInit[] = new Array(1000);
for (var i = 0; i < 1000; ++i) status[i] = { status: i };
