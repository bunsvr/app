import { t } from 'wint-js';

export interface Context<Path extends string = any, State extends t.BaseState = {}> extends t.Context<Path, State> {
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
}

/**
 * A guard function
 */
export interface Guard<Path extends string = any> extends Handler<Path> {
    skipCheck: boolean;
}
