import { t } from 'wint-js';

export interface Context<Path extends string = any, State extends t.BaseState = {}> extends t.Context<Path, State>, Bun.ResponseInit {
    /**
     * The response body
     */
    body?: any;
};

/**
 * A request handler
 */
export interface Handler<Path extends string = any, State extends t.BaseState = {}> {
    (c: Context<Path, State>): any;

    noValidation?: boolean;
    fallback?: Handler<Path, State>;
}

