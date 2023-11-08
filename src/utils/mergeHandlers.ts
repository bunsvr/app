import { Handler } from '../types';

export default (handlers: Handler[]) => {
    if (handlers.length === 1) return handlers[0];

    let content = '', isAsync = false,
        keys = [], values = [], lastHandler = handlers.length - 1;

    for (var i = 0; i < lastHandler; ++i) {
        var fn = handlers[i], name = 'f' + i;

        content += 'if('

        // If function is async
        if (fn.constructor.name === 'AsyncFunction') {
            isAsync = true;
            content += 'await ';
        }

        // Validation
        content += name + '(c)===null)return null;';

        keys.push(name);
        values.push(fn);
    }

    name = 'f' + i;

    content += `return ${name}(c)`;

    keys.push(name);
    values.push(handlers[lastHandler]);

    // Final handler string
    content = 'return ' + (
        isAsync ? 'async' : ''
    ) + ` c=>{${content}}`;

    return Function(...keys, content)(...values);
};
