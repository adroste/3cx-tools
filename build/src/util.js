"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProperPath = void 0;
const appRoot = require("app-root-path");
const path_1 = require("path");
function getProperPath(path) {
    if (path.startsWith('./') || path.startsWith('../'))
        return (0, path_1.join)(appRoot.toString(), path);
    return path;
}
exports.getProperPath = getProperPath;
//# sourceMappingURL=util.js.map