const eventsOpts = {
    headers: {
        'Content-Type': 'text/event-stream'
    }
}

/**
 * Setup server sent events
 */
export const events = <R = any>(
    source: DirectUnderlyingSource<R>
) => new Response(
    new ReadableStream(source),
    eventsOpts
);
