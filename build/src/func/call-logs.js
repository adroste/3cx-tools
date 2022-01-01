"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offCallLogs = exports.onCallLogs = exports.getCallLogs = exports.stopMonitorCallLogs = exports.monitorCallLogs = exports.updateCallLogs = void 0;
const tslib_1 = require("tslib");
const active_calls_1 = require("./active-calls");
const events_1 = require("events");
const database_1 = require("../database");
const caller_id_1 = require("./caller-id");
const TAG = '[Call Log Monitor]';
const CALL_LOG_LIMIT = 1000;
const callLogsMonitor = new events_1.EventEmitter();
let callLogs = [];
let activeCallsHookTimers = [];
function activeCallsChangeUpdateHook() {
    activeCallsHookTimers.forEach(timer => clearTimeout(timer));
    activeCallsHookTimers = [
        setTimeout(updateCallLogs, 1000),
        setTimeout(updateCallLogs, 10000),
        setTimeout(updateCallLogs, 60000),
    ];
}
function updateCallLogs() {
    var _a;
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const nextId = ((_a = callLogs[0]) === null || _a === void 0 ? void 0 : _a.id) + 1 || 0;
        const newLogs = yield queryCallLogs(nextId);
        if (newLogs.length > 0) {
            callLogs = [
                ...newLogs.slice(0, CALL_LOG_LIMIT),
                ...callLogs.slice(0, Math.max(CALL_LOG_LIMIT - newLogs.length, 0))
            ];
            callLogsMonitor.emit('callLogs', newLogs);
        }
    });
}
exports.updateCallLogs = updateCallLogs;
function monitorCallLogs() {
    updateCallLogs();
    (0, active_calls_1.onActiveCallsChange)(activeCallsChangeUpdateHook);
    console.log(TAG, 'started');
}
exports.monitorCallLogs = monitorCallLogs;
function stopMonitorCallLogs() {
    (0, active_calls_1.offActiveCallsChange)(activeCallsChangeUpdateHook);
    console.log(TAG, 'stopped');
}
exports.stopMonitorCallLogs = stopMonitorCallLogs;
function getCallLogs() {
    return callLogs;
}
exports.getCallLogs = getCallLogs;
function onCallLogs(listener) {
    callLogsMonitor.on('callLogs', listener);
}
exports.onCallLogs = onCallLogs;
function offCallLogs(listener) {
    callLogsMonitor.off('callLogs', listener);
}
exports.offCallLogs = offCallLogs;
function getCallerTypeFromDnType(dnType) {
    switch (dnType) {
        case 0: return 'Internal';
        case 1: return 'External';
        case 5: return 'Voicemail';
        case 6: return 'IVR';
        case 13: return 'External';
        default: return undefined;
    }
}
function clPartyInfoToCallerInfo(dn, dnType, callerNumber, displayName) {
    const type = getCallerTypeFromDnType(dnType);
    if (type === 'External') {
        const entry = (0, caller_id_1.resolveCaller)(callerNumber);
        return {
            displayName: (entry === null || entry === void 0 ? void 0 : entry.displayName) || displayName,
            phoneNumber: callerNumber,
            phoneBookId: (entry === null || entry === void 0 ? void 0 : entry.id) || undefined,
            type
        };
    }
    else {
        return {
            displayName,
            phoneNumber: dn,
            type
        };
    }
}
function queryCallLogs(minCallId) {
    return (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
        const callsRes = yield (0, database_1.getDb)().query(`
SELECT * FROM public.cl_calls 
WHERE id >= $1
ORDER BY id DESC 
LIMIT $2
`, [minCallId, CALL_LOG_LIMIT]);
        const calls = callsRes.rows;
        if (calls.length === 0)
            return [];
        const maxCallId = calls[0].id;
        minCallId = calls[calls.length - 1].id;
        const segmentsRes = yield (0, database_1.getDb)().query(`
SELECT call_id, cl_segments.id as segment_id, start_time, end_time, 
	src.dn AS src_dn, src.dn_type as src_dn_type, src.caller_number as src_caller_number, src.display_name as src_display_name, 
	dst.dn AS dst_dn, dst.dn_type as dst_dn_type, dst.caller_number as dst_caller_number, dst.display_name as dst_display_name 
FROM public.cl_segments
LEFT JOIN public.cl_party_info src 
	ON src_part_id = src.id
LEFT JOIN public.cl_party_info dst
	on dst_part_id = dst.id
WHERE call_id >= $1 AND call_id <= $2
  AND action_id != 1
ORDER BY call_id ASC, seq_order ASC
`, [minCallId, maxCallId]);
        const segments = segmentsRes.rows;
        const segmentsById = segments.reduce((segmentsById, s) => {
            if (!segmentsById[s.call_id])
                segmentsById[s.call_id] = [];
            const from = clPartyInfoToCallerInfo(s.src_dn, s.src_dn_type, s.src_caller_number, s.src_display_name);
            const to = clPartyInfoToCallerInfo(s.dst_dn, s.dst_dn_type, s.dst_caller_number, s.dst_display_name);
            segmentsById[s.call_id].push({
                direction: from.type === 'Internal' ? 'outgoing' : 'incoming',
                endTime: s.end_time,
                from,
                segmentId: s.segment_id,
                startTime: s.start_time,
                to,
            });
            return segmentsById;
        }, {});
        const callLogs = [];
        calls.forEach(call => {
            var _a;
            const segments = segmentsById[call.id];
            if (!segments) {
                console.error(TAG, 'segments is undefined. call:', call);
                return;
            }
            let extCaller = segments[0].direction === 'incoming'
                ? segments[0].from : segments[0].to;
            for (const segment of segments) {
                if (segment.from.type === 'External') {
                    extCaller = segment.from;
                    break;
                }
                else if (segment.to.type === 'External') {
                    extCaller = segment.to;
                    break;
                }
            }
            callLogs.push({
                id: call.id,
                answered: call.is_answered,
                direction: segments[0].direction,
                endTime: call.end_time,
                segments,
                extCaller,
                startTime: call.start_time,
                talkingDuration: (_a = call.talking_dur) === null || _a === void 0 ? void 0 : _a.toISOString(),
            });
        });
        return callLogs;
    });
}
//# sourceMappingURL=call-logs.js.map