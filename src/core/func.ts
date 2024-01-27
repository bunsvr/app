import { Handler } from '../types';

/**
 * This function tells the merge handler function 
 * to skip checking result of this guard function
 */
export const layer = <T extends Handler>(fn: T): T => {
    fn.noValidation = true;
    return fn;
}

/**
 * Type wrapper for a standalone guard
 */
export const guard = <T extends Handler>(fn: T): T => fn;
