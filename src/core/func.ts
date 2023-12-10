import { Handler } from '../types';

/**
 * This function tells the merge handler function 
 * to skip checking result of this guard function
 */
export const layer = (fn: Handler) => {
    fn.noValidation = true;
    return fn;
}

/**
 * Just a type-safe wrapper for guards
 */
export const guard = (fn: Handler) => fn;
