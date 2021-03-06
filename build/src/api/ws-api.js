"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWsApi = exports.io = exports.SEND_MSG = exports.RECV_MSG = void 0;
const tslib_1 = require("tslib");
const active_calls_1 = require("../func/active-calls");
const call_logs_1 = require("../func/call-logs");
const auth_1 = require("./auth");
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
    exports.io.use((socket, next) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const username = socket.handshake.auth.username || '';
        const password = socket.handshake.auth.password || '';
        if ((yield (0, auth_1.checkDnReporterAccess)(username))
            && (yield (0, auth_1.checkDnPassword)(username, password))) {
            next();
        }
        else {
            next(new Error('authentication failed'));
            socket.disconnect();
        }
    }));
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
        socket.on('disconnect', () => {
            (0, active_calls_1.offActiveCallsChange)(sendActiveCalls);
            (0, call_logs_1.offCallLogs)(sendCallLogs);
        });
    });
}
//# sourceMappingURL=ws-api.js.map