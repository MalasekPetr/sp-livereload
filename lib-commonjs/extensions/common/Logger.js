"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogError = exports.LogDebug = exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Warning"] = 2] = "Warning";
    LogLevel[LogLevel["Error"] = 3] = "Error";
    LogLevel[LogLevel["Fatal"] = 4] = "Fatal";
    LogLevel[LogLevel["None"] = 5] = "None";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    static LOG_STRING_PREFIX = "💫 Live Reload Bar ::: \n\t";
    /**
     * Logs the provided data to the console with a prefix.
     *
     * @param data - The data to be logged.
     */
    static log(logLevel, data) {
        data.unshift(Logger.LOG_STRING_PREFIX);
        if (logLevel === LogLevel.Error) {
            console.error(...data);
        }
        else {
            console.group(...data);
            console.groupEnd();
        }
    }
    static debug(...data) {
        Logger.log(LogLevel.Debug, data);
    }
    static error(...data) {
        Logger.log(LogLevel.Error, data);
    }
}
exports.Logger = Logger;
exports.LogDebug = Logger.debug;
exports.LogError = Logger.error;
//# sourceMappingURL=Logger.js.map