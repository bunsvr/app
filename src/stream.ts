import { events as eventsOpts } from './options';

/**
 * Stream the content of a direct `ReadableStream`
 */
export const direct = <R = any>(
    source: DirectUnderlyingSource<R>
) => new Response(
    new ReadableStream(source),
    eventsOpts
);
