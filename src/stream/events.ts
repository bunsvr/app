import { Context } from '../types';
import { events as eventsOpts } from '../utils/options';

/**
 * Events start function
 */
export interface EventFunction {
    (controller: ReadableStreamDirectController, ctx: Context): any;
}

const args = (fn: Function) => fn.length === 1 ? '_' : '_,c';

/**
 * Create an events stream
 */
export class Events {
    /**
     * The underlying source
     */
    constructor(public fnPull: EventFunction) { }

    /**
     * Abort function
     */
    fnAbort: EventFunction = c => {
        c.close()
    };

    /**
     * Handle on request signal abort
     */
    abort(fn: EventFunction) {
        this.fnAbort = fn;
        return this;
    }

    /**
     * Cancel function
     */
    fnCancel: EventFunction = null;

    /**
     * Handle error
     */
    cancel(fn: EventFunction) {
        this.fnCancel = fn;
        return this;
    }

    /**
     * Create a stream
     */
    stream(): (c: Context) => Response {
        const
            { fnPull, fnAbort, fnCancel } = this,
            isPullAsync = fnPull.constructor.name === 'AsyncFunction',

            // Call the pull function
            pullCall = 'while(!c.signal.aborted)' + (
                isPullAsync ? 'await ' : ''
            ) + `pull(${args(fnPull)})` + (fnAbort === null ? '' : `;abort(${args(fnAbort)})`),

            // Readable stream options
            options = `type:'direct'` + `,pull:${isPullAsync ? 'async ' : ''}_=>{${pullCall}}` + (
                fnCancel === null ? '' : `,cancel${
                    // Check arguments length
                    fnCancel.length === 1 ? '' : ':_=>{cancel(_,c)}'}`
            );

        return Function(
            'pull', 'abort', 'cancel', 'o',
            `return c=>new Response(new ReadableStream({${options}}),o)`
        )(fnPull, fnAbort, fnCancel, eventsOpts);
    }
}

/**
 * Create an event stream
 */
export const events = (fn: EventFunction) => new Events(fn);
