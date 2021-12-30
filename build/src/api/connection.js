"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectTo3cxApi = exports.api = void 0;
const tslib_1 = require("tslib");
const _3cx_api_1 = require("@adroste/3cx-api");
const database_1 = require("../database");
const TAG = '[3CX REST API]';
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
function connectTo3cxApi() {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const credentials = yield getApiLoginCredentials();
        const creds = { Username: credentials.username, Password: credentials.password };
        const httpClient = yield (0, _3cx_api_1.createClient)('http://localhost:5000', creds);
        console.log(TAG, 'connected');
        let authorizing = null;
        httpClient.interceptors.response.use(response => response, error => {
            var _a;
            if (((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) !== 401) {
                return Promise.reject(error);
            }
            authorizing !== null && authorizing !== void 0 ? authorizing : (authorizing = (0, _3cx_api_1.login)(httpClient, creds)
                .finally(() => authorizing = null)
                .then(data => {
                if (data !== 'AuthSuccess')
                    return Promise.reject(error);
                return Promise.resolve();
            })
                .catch(error => Promise.reject(error)));
            const originalRequestConfig = error.config;
            delete originalRequestConfig.headers['Cookie'];
            delete originalRequestConfig.httpAgent;
            delete originalRequestConfig.httpsAgent;
            delete originalRequestConfig.jar;
            return authorizing.then(() => httpClient.request(originalRequestConfig));
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