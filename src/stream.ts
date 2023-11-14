export * from './stream/events';

export type StreamUnderlyingSource = ConstructorParameters<typeof ReadableStream>[0];

/**
 * Create and stream the source
 */
export const source = (source: StreamUnderlyingSource) => new Response(
    new ReadableStream(source)
);

export default source;
