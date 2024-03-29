import { Handler } from '../types';

const args = (fn: Handler) => fn.length === 0 ? '' : 'c';

export default (handlers: Handler[]) => {
    if (handlers.length === 1) return handlers[0];

    let content = '', isAsync = false,
        keys = [], values = [], lastHandler = handlers.length - 1;

    // Chain
    for (let i = 0; i < lastHandler; ++i) {
        let name = 'f' + i,
            fnCall = name + `(${args(handlers[i])})`,
            fnFallback = 'null';

        if (handlers[i].fallback) {
            // Get name and push to key list first
            fnFallback = 'f_' + i;
            keys.push(fnFallback);
            values.push(handlers[i].fallback);

            // Set to caller
            fnFallback += `(${args(handlers[i].fallback)})`;
        }

        // If function is async
        if (handlers[i].constructor.name === 'AsyncFunction') {
            isAsync = true;
            fnCall = 'await ' + fnCall;
        }

        content += handlers[i].noValidation
            ? fnCall + ';' : `if(${fnCall}===null)return ${fnFallback};`;

        keys.push(name);
        values.push(handlers[i]);
    }

    // Last handler should be returned directly
    const name = 'f' + lastHandler;
    content += `return ${name}(${args(handlers[lastHandler])})`;

    keys.push(name);
    values.push(handlers[lastHandler]);

    // Final handler string
    content = 'return ' + (
        isAsync ? 'async' : ''
    ) + ` c=>{${content}}`;

    return Function(...keys, content)(...values);
};









