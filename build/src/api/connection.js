"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectTo3cxApi = exports.api = void 0;
const tslib_1 = require("tslib");
const _3cx_api_1 = require("@adroste/3cx-api");
const database_1 = require("../database");
const TAG = '[3CX REST API]';
const RECONNECT_MAX_TRY = 1000;
let reconnectTimeout = null;
function getApiLoginCredentials() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const res = yield (0, database_1.getDb)().query(`SELECT name,value FROM public.parameter WHERE name='WEBSERVERUSER' OR name ='WEBSERVERPASS'`);
        const rows = res.rows;
        const table = rows.reduce((table, cur) => {
            table[cur.name] = cur.value;
            return table;
        }, {});
        return {
            username: table['WEBSERVERUSER'],
            password: table['WEBSERVERPASS'],
        };
    });
}
function reconnectLoop(i = 1) {
    if (reconnectTimeout)
        return;
    if (i === RECONNECT_MAX_TRY)
        throw new Error('3cx rest api max reconnect attempts exceeded');
    reconnectTimeout = setTimeout(() => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        try {
            yield connectTo3cxApi();
        }
        catch (err) {
            console.error(TAG, `reconnect failed (${i}), trying againg...`);
            reconnectTimeout = null;
            reconnectLoop(i + 1);
        }
    }), 1000);
}
function connectTo3cxApi() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const credentials = yield getApiLoginCredentials();
        const httpClient = yield (0, _3cx_api_1.createClient)('http://localhost:5000', { Username: credentials.username, Password: credentials.password });
        console.log(TAG, 'connected');
        httpClient.interceptors.response.use(response => response, error => {
            if (!(error === null || error === void 0 ? void 0 : error.response)
                || error.response.status === 401) {
                reconnectLoop();
            }
            return Promise.reject(error);
        });
        exports.api = {
            httpClient,
            consoleClient: new _3cx_api_1.ConsoleClient(httpClient),
            dashboardClient: new _3cx_api_1.DashboardClient(httpClient),
        };
    });
}
exports.connectTo3cxApi = connectTo3cxApi;
//# sourceMappingURL=connection.js.map