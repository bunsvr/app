import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const f = (directory: string, validator: (path: string) => boolean) => {
    const files: string[] = [];

    for (var item of readdirSync(directory)) {
        var itemPath = join(directory, item), fileStat = statSync(itemPath);

        if (fileStat.isDirectory())
            files.push(...f(itemPath, validator));
        else if (fileStat.isFile())
            if (validator(itemPath))
                files.push(itemPath);
    }

    return files;
}

export default f;
