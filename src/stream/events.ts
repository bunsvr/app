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

    private createReadableStreamMacro() {
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

        return `new ReadableStream(${options})`;
    }

    /**
     * Create a response sender
     */
    send(): (c: Context) => Response {
        return Function(
            'pull', 'abort', 'cancel', 'o',
            `return c=>new Response(${this.createReadableStreamMacro()},o)`
        )(this.fnPull, this.fnAbort, this.fnCancel, eventsOpts);
    }

    /**
     * Create a function that creates a stream
     */
    stream(): (c: Context) => ReadableStream {
        return Function(
            'pull', 'abort', 'cancel',
            `return c=>${this.createReadableStreamMacro()}`
        )(this.fnPull, this.fnAbort, this.fnCancel);
    }
}

/**
 * Create an event stream
 */
export const events = (fn: EventFunction) => new Events(fn);
