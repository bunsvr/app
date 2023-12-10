import { Handler } from '../types';

const args = (fn: Handler) => fn.length === 1 ? 'c' : '';

export default (handlers: Handler[], fallback: Handler) => {
    if (handlers.length === 1) return handlers[0];

    const hasFallback = fallback !== null;

    let content = '', isAsync = false, fallbackFn = 'null',
        keys = [], values = [], lastHandler = handlers.length - 1;

    // If a fallback fn exists
    if (hasFallback) {
        fallbackFn = `f_(${args(fallback)})`;
        keys.push('f_');
        values.push(fallback);
    }

    // Chain
    for (var i = 0; i < lastHandler; ++i) {
        var name = 'f' + i, fnCall = name + `(${args(handlers[i])})`;

        // If function is async
        if (handlers[i].constructor.name === 'AsyncFunction') {
            isAsync = true;
            fnCall = 'await ' + fnCall;
            content += 'await ';
        }

        content += handlers[i].noValidation
            ? fnCall + ';' : `if(${fnCall}===null)return ${fallbackFn};`;

        keys.push(name);
        values.push(handlers[i]);
    }

    // Last handler should be returned directly
    name = 'f' + i;
    content += `return ${name}(${args(handlers[lastHandler])})`;

    keys.push(name);
    values.push(handlers[lastHandler]);

    // Final handler string
    content = 'return ' + (
        isAsync ? 'async' : ''
    ) + ` c=>{${content}}`;

    return Function(...keys, content)(...values);
};












