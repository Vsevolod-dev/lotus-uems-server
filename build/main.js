const express = require('express');
const app = express();
const wss = require('express-ws')(app);
const aWss = wss.getWss();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
let timers = [];
app.ws('/', (ws) => {
    console.log('Connection success');
    ws.send('You have successfully connected');
    ws.on('message', (msg) => {
        const ParsedMsg = JSON.parse(msg);
        switch (ParsedMsg.event) {
            case 'connection':
                connectionHandler(ws, ParsedMsg);
                break;
        }
    });
});
app.listen(PORT, () => console.log(`Server has started on ${PORT} port`));
const connectionHandler = (ws, msg) => {
    ws.id = msg.id;
    const timer = timers.find(timer => timer.id === msg.id);
    if (!timer) {
        timers.push({
            time: 120,
            id: msg.id
        });
        let timer = setInterval(function () {
            const currentTimer = timers.find(timer => timer.id === msg.id);
            if (!currentTimer)
                return;
            if (currentTimer.time <= 1) {
                clearInterval(timer);
            }
            --currentTimer.time;
            broadcastConnection(ws, {
                id: Date.now().toString(),
                event: "time",
                socketId: currentTimer.id,
                message: currentTimer.time
            });
        }, 1000);
    }
    else {
        if (timer.time === 0) {
            broadcastConnection(ws, {
                id: Date.now().toString(),
                event: "transfers-end",
                socketId: timer.id
            });
        }
    }
    broadcastConnection(ws, msg);
};
const broadcastConnection = (ws, msg) => {
    aWss.clients.forEach((client) => {
        if (client.id === msg.socketId) {
            client.send(`${JSON.stringify(msg)}`);
        }
    });
};
export {};
//# sourceMappingURL=main.js.map