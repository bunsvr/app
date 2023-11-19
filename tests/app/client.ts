const ws = new WebSocket('http://localhost:3000/api/ws');

ws.onopen = () => ws.send('Ping');
ws.onmessage = console.log;

