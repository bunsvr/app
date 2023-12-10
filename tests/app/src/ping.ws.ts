import { ws } from '@stricjs/app';

// This will be automatically registered
export default ws.route<{ id: string }>({
    message(ws, msg) {
        if (msg === 'Ping')
            ws.send(ws.data.id);
    }
});

