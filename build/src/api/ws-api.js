"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWsApi = exports.io = exports.SEND_MSG = exports.RECV_MSG = void 0;
const call_logs_1 = require("../func/call-logs");
const active_calls_1 = require("../func/active-calls");
const socket_io_1 = require("socket.io");
const web_server_1 = require("../web-server");
const TAG = '[Websocket API]';
exports.RECV_MSG = {
    subscribeActiveCalls: 'subscribeActiveCalls',
    unsubscribeActiveCalls: 'unsubscribeActiveCalls',
    subscribeCallLogs: 'subscribeCallLogs',
    unsubscribeCallLogs: 'unsubscribeCallLogs',
};
exports.SEND_MSG = {
    activeCalls: 'activeCalls',
    callLogs: 'callLogs',
};
function initWsApi() {
    exports.io = new socket_io_1.Server(web_server_1.httpServer, {
        path: '/3cx-tools/socket.io',
        cors: {
            origin: true,
            credentials: true,
        }
    });
    console.log(TAG, `WS api listening...`);
    setListener();
}
exports.initWsApi = initWsApi;
function setListener() {
    exports.io.on('connection', socket => {
        let subscribedActiveCalls = false;
        function sendActiveCalls(activeCalls) {
            socket.emit(exports.SEND_MSG.activeCalls, activeCalls);
        }
        socket.on(exports.RECV_MSG.subscribeActiveCalls, () => {
            if (subscribedActiveCalls)
                return;
            subscribedActiveCalls = true;
            (0, active_calls_1.onActiveCallsChange)(sendActiveCalls);
            sendActiveCalls((0, active_calls_1.getActiveCalls)());
        });
        socket.on(exports.RECV_MSG.unsubscribeActiveCalls, () => {
            (0, active_calls_1.offActiveCallsChange)(sendActiveCalls);
            subscribedActiveCalls = false;
        });
        let subscribedCallLogs = false;
        function sendCallLogs(callLogs) {
            socket.emit(exports.SEND_MSG.callLogs, callLogs);
        }
        socket.on(exports.RECV_MSG.subscribeCallLogs, () => {
            if (subscribedCallLogs)
                return;
            subscribedCallLogs = true;
            (0, call_logs_1.onCallLogs)(sendCallLogs);
            sendCallLogs((0, call_logs_1.getCallLogs)());
        });
        socket.on(exports.RECV_MSG.unsubscribeCallLogs, () => {
            (0, call_logs_1.offCallLogs)(sendCallLogs);
            subscribedCallLogs = false;
        });
    });
}
//# sourceMappingURL=ws-api.js.map