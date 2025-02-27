import { __assign, __values } from "tslib";
import { isError, isPlainObject, logger, normalize } from '@sentry/utils';
/** Patch toString calls to return proper name for wrapped functions */
var ExtraErrorData = /** @class */ (function () {
    /**
     * @inheritDoc
     */
    function ExtraErrorData(_options) {
        if (_options === void 0) { _options = { depth: 3 }; }
        this._options = _options;
        /**
         * @inheritDoc
         */
        this.name = ExtraErrorData.id;
    }
    /**
     * @inheritDoc
     */
    ExtraErrorData.prototype.setupOnce = function (addGlobalEventProcessor, getCurrentHub) {
        addGlobalEventProcessor(function (event, hint) {
            var self = getCurrentHub().getIntegration(ExtraErrorData);
            if (!self) {
                return event;
            }
            return self.enhanceEventWithErrorData(event, hint);
        });
    };
    /**
     * Attaches extracted information from the Error object to extra field in the Event
     */
    ExtraErrorData.prototype.enhanceEventWithErrorData = function (event, hint) {
        var _a;
        if (!hint || !hint.originalException || !isError(hint.originalException)) {
            return event;
        }
        var name = hint.originalException.name || hint.originalException.constructor.name;
        var errorData = this._extractErrorData(hint.originalException);
        if (errorData) {
            var contexts = __assign({}, event.contexts);
            var normalizedErrorData = normalize(errorData, this._options.depth);
            if (isPlainObject(normalizedErrorData)) {
                contexts = __assign(__assign({}, event.contexts), (_a = {}, _a[name] = __assign({}, normalizedErrorData), _a));
            }
            return __assign(__assign({}, event), { contexts: contexts });
        }
        return event;
    };
    /**
     * Extract extra information from the Error object
     */
    ExtraErrorData.prototype._extractErrorData = function (error) {
        var e_1, _a, e_2, _b;
        // We are trying to enhance already existing event, so no harm done if it won't succeed
        try {
            var nativeKeys = [
                'name',
                'message',
                'stack',
                'line',
                'column',
                'fileName',
                'lineNumber',
                'columnNumber',
                'toJSON',
            ];
            var extraErrorInfo = {};
            try {
                // We want only enumerable properties, thus `getOwnPropertyNames` is redundant here, as we filter keys anyway.
                for (var _c = __values(Object.keys(error)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var key = _d.value;
                    if (nativeKeys.indexOf(key) !== -1) {
                        continue;
                    }
                    var value = error[key];
                    extraErrorInfo[key] = isError(value) ? value.toString() : value;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Check if someone attached `toJSON` method to grab even more properties (eg. axios is doing that)
            if (typeof error.toJSON === 'function') {
                var serializedError = error.toJSON();
                try {
                    for (var _e = __values(Object.keys(serializedError)), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var key = _f.value;
                        var value = serializedError[key];
                        extraErrorInfo[key] = isError(value) ? value.toString() : value;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            return extraErrorInfo;
        }
        catch (oO) {
            logger.error('Unable to extract extra data from the Error object:', oO);
        }
        return null;
    };
    /**
     * @inheritDoc
     */
    ExtraErrorData.id = 'ExtraErrorData';
    return ExtraErrorData;
}());
export { ExtraErrorData };
//# sourceMappingURL=extraerrordata.js.map