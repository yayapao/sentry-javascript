import { __assign, __rest } from "tslib";
import { browserPerformanceTimeOrigin, getGlobalObject, htmlTreeAsString, isNodeEnv, logger } from '@sentry/utils';
import { msToSec } from '../utils';
import { getCLS } from './web-vitals/getCLS';
import { getFID } from './web-vitals/getFID';
import { getLCP } from './web-vitals/getLCP';
import { getVisibilityWatcher } from './web-vitals/lib/getVisibilityWatcher';
var global = getGlobalObject();
/** Class tracking metrics  */
var MetricsInstrumentation = /** @class */ (function () {
    function MetricsInstrumentation(_reportAllChanges) {
        if (_reportAllChanges === void 0) { _reportAllChanges = false; }
        this._reportAllChanges = _reportAllChanges;
        this._measurements = {};
        this._performanceCursor = 0;
        if (!isNodeEnv() && global && global.performance && global.document) {
            if (global.performance.mark) {
                global.performance.mark('sentry-tracing-init');
            }
            this._trackCLS();
            this._trackLCP();
            this._trackFID();
        }
    }
    /** Add performance related spans to a transaction */
    MetricsInstrumentation.prototype.addPerformanceEntries = function (transaction) {
        var _this = this;
        if (!global || !global.performance || !global.performance.getEntries || !browserPerformanceTimeOrigin) {
            // Gatekeeper if performance API not available
            return;
        }
        logger.log('[Tracing] Adding & adjusting spans using Performance API');
        var timeOrigin = msToSec(browserPerformanceTimeOrigin);
        var entryScriptSrc;
        if (global.document && global.document.scripts) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (var i = 0; i < global.document.scripts.length; i++) {
                // We go through all scripts on the page and look for 'data-entry'
                // We remember the name and measure the time between this script finished loading and
                // our mark 'sentry-tracing-init'
                if (global.document.scripts[i].dataset.entry === 'true') {
                    entryScriptSrc = global.document.scripts[i].src;
                    break;
                }
            }
        }
        var entryScriptStartTimestamp;
        var tracingInitMarkStartTime;
        var responseStartTimestamp;
        var requestStartTimestamp;
        global.performance
            .getEntries()
            .slice(this._performanceCursor)
            .forEach(function (entry) {
            var startTime = msToSec(entry.startTime);
            var duration = msToSec(entry.duration);
            if (transaction.op === 'navigation' && timeOrigin + startTime < transaction.startTimestamp) {
                return;
            }
            switch (entry.entryType) {
                case 'navigation': {
                    addNavigationSpans(transaction, entry, timeOrigin);
                    responseStartTimestamp = timeOrigin + msToSec(entry.responseStart);
                    requestStartTimestamp = timeOrigin + msToSec(entry.requestStart);
                    break;
                }
                case 'mark':
                case 'paint':
                case 'measure': {
                    var startTimestamp = addMeasureSpans(transaction, entry, startTime, duration, timeOrigin);
                    if (tracingInitMarkStartTime === undefined && entry.name === 'sentry-tracing-init') {
                        tracingInitMarkStartTime = startTimestamp;
                    }
                    // capture web vitals
                    var firstHidden = getVisibilityWatcher();
                    // Only report if the page wasn't hidden prior to the web vital.
                    var shouldRecord = entry.startTime < firstHidden.firstHiddenTime;
                    if (entry.name === 'first-paint' && shouldRecord) {
                        logger.log('[Measurements] Adding FP');
                        _this._measurements['fp'] = { value: entry.startTime };
                        _this._measurements['mark.fp'] = { value: startTimestamp };
                    }
                    if (entry.name === 'first-contentful-paint' && shouldRecord) {
                        logger.log('[Measurements] Adding FCP');
                        _this._measurements['fcp'] = { value: entry.startTime };
                        _this._measurements['mark.fcp'] = { value: startTimestamp };
                    }
                    break;
                }
                case 'resource': {
                    var resourceName = entry.name.replace(global.location.origin, '');
                    var endTimestamp = addResourceSpans(transaction, entry, resourceName, startTime, duration, timeOrigin);
                    // We remember the entry script end time to calculate the difference to the first init mark
                    if (entryScriptStartTimestamp === undefined && (entryScriptSrc || '').indexOf(resourceName) > -1) {
                        entryScriptStartTimestamp = endTimestamp;
                    }
                    break;
                }
                default:
                // Ignore other entry types.
            }
        });
        if (entryScriptStartTimestamp !== undefined && tracingInitMarkStartTime !== undefined) {
            _startChild(transaction, {
                description: 'evaluation',
                endTimestamp: tracingInitMarkStartTime,
                op: 'script',
                startTimestamp: entryScriptStartTimestamp,
            });
        }
        this._performanceCursor = Math.max(performance.getEntries().length - 1, 0);
        this._trackNavigator(transaction);
        // Measurements are only available for pageload transactions
        if (transaction.op === 'pageload') {
            // normalize applicable web vital values to be relative to transaction.startTimestamp
            var timeOrigin_1 = msToSec(browserPerformanceTimeOrigin);
            // Generate TTFB (Time to First Byte), which measured as the time between the beginning of the transaction and the
            // start of the response in milliseconds
            if (typeof responseStartTimestamp === 'number') {
                logger.log('[Measurements] Adding TTFB');
                this._measurements['ttfb'] = { value: (responseStartTimestamp - transaction.startTimestamp) * 1000 };
                if (typeof requestStartTimestamp === 'number' && requestStartTimestamp <= responseStartTimestamp) {
                    // Capture the time spent making the request and receiving the first byte of the response.
                    // This is the time between the start of the request and the start of the response in milliseconds.
                    this._measurements['ttfb.requestTime'] = { value: (responseStartTimestamp - requestStartTimestamp) * 1000 };
                }
            }
            ['fcp', 'fp', 'lcp'].forEach(function (name) {
                if (!_this._measurements[name] || timeOrigin_1 >= transaction.startTimestamp) {
                    return;
                }
                // The web vitals, fcp, fp, lcp, and ttfb, all measure relative to timeOrigin.
                // Unfortunately, timeOrigin is not captured within the transaction span data, so these web vitals will need
                // to be adjusted to be relative to transaction.startTimestamp.
                var oldValue = _this._measurements[name].value;
                var measurementTimestamp = timeOrigin_1 + msToSec(oldValue);
                // normalizedValue should be in milliseconds
                var normalizedValue = Math.abs((measurementTimestamp - transaction.startTimestamp) * 1000);
                var delta = normalizedValue - oldValue;
                logger.log("[Measurements] Normalized " + name + " from " + oldValue + " to " + normalizedValue + " (" + delta + ")");
                _this._measurements[name].value = normalizedValue;
            });
            if (this._measurements['mark.fid'] && this._measurements['fid']) {
                // create span for FID
                _startChild(transaction, {
                    description: 'first input delay',
                    endTimestamp: this._measurements['mark.fid'].value + msToSec(this._measurements['fid'].value),
                    op: 'web.vitals',
                    startTimestamp: this._measurements['mark.fid'].value,
                });
            }
            // If FCP is not recorded we should not record the cls value
            // according to the new definition of CLS.
            if (!('fcp' in this._measurements)) {
                delete this._measurements.cls;
            }
            transaction.setMeasurements(this._measurements);
            this._tagMetricInfo(transaction);
            transaction.setTag('sentry_reportAllChanges', this._reportAllChanges);
        }
    };
    /** Add LCP / CLS data to transaction to allow debugging */
    MetricsInstrumentation.prototype._tagMetricInfo = function (transaction) {
        if (this._lcpEntry) {
            logger.log('[Measurements] Adding LCP Data');
            // Capture Properties of the LCP element that contributes to the LCP.
            if (this._lcpEntry.element) {
                transaction.setTag('lcp.element', htmlTreeAsString(this._lcpEntry.element));
            }
            if (this._lcpEntry.id) {
                transaction.setTag('lcp.id', this._lcpEntry.id);
            }
            if (this._lcpEntry.url) {
                // Trim URL to the first 200 characters.
                transaction.setTag('lcp.url', this._lcpEntry.url.trim().slice(0, 200));
            }
            transaction.setTag('lcp.size', this._lcpEntry.size);
        }
        // See: https://developer.mozilla.org/en-US/docs/Web/API/LayoutShift
        if (this._clsEntry && this._clsEntry.sources) {
            logger.log('[Measurements] Adding CLS Data');
            this._clsEntry.sources.forEach(function (source, index) {
                return transaction.setTag("cls.source." + (index + 1), htmlTreeAsString(source.node));
            });
        }
    };
    /** Starts tracking the Cumulative Layout Shift on the current page. */
    MetricsInstrumentation.prototype._trackCLS = function () {
        var _this = this;
        // See:
        // https://web.dev/evolving-cls/
        // https://web.dev/cls-web-tooling/
        getCLS(function (metric) {
            var entry = metric.entries.pop();
            if (!entry) {
                return;
            }
            logger.log('[Measurements] Adding CLS');
            _this._measurements['cls'] = { value: metric.value };
            _this._clsEntry = entry;
        });
    };
    /**
     * Capture the information of the user agent.
     */
    MetricsInstrumentation.prototype._trackNavigator = function (transaction) {
        var navigator = global.navigator;
        if (!navigator) {
            return;
        }
        // track network connectivity
        var connection = navigator.connection;
        if (connection) {
            if (connection.effectiveType) {
                transaction.setTag('effectiveConnectionType', connection.effectiveType);
            }
            if (connection.type) {
                transaction.setTag('connectionType', connection.type);
            }
            if (isMeasurementValue(connection.rtt)) {
                this._measurements['connection.rtt'] = { value: connection.rtt };
            }
            if (isMeasurementValue(connection.downlink)) {
                this._measurements['connection.downlink'] = { value: connection.downlink };
            }
        }
        if (isMeasurementValue(navigator.deviceMemory)) {
            transaction.setTag('deviceMemory', String(navigator.deviceMemory));
        }
        if (isMeasurementValue(navigator.hardwareConcurrency)) {
            transaction.setTag('hardwareConcurrency', String(navigator.hardwareConcurrency));
        }
    };
    /** Starts tracking the Largest Contentful Paint on the current page. */
    MetricsInstrumentation.prototype._trackLCP = function () {
        var _this = this;
        getLCP(function (metric) {
            var entry = metric.entries.pop();
            if (!entry) {
                return;
            }
            var timeOrigin = msToSec(browserPerformanceTimeOrigin);
            var startTime = msToSec(entry.startTime);
            logger.log('[Measurements] Adding LCP');
            _this._measurements['lcp'] = { value: metric.value };
            _this._measurements['mark.lcp'] = { value: timeOrigin + startTime };
            _this._lcpEntry = entry;
        }, this._reportAllChanges);
    };
    /** Starts tracking the First Input Delay on the current page. */
    MetricsInstrumentation.prototype._trackFID = function () {
        var _this = this;
        getFID(function (metric) {
            var entry = metric.entries.pop();
            if (!entry) {
                return;
            }
            var timeOrigin = msToSec(browserPerformanceTimeOrigin);
            var startTime = msToSec(entry.startTime);
            logger.log('[Measurements] Adding FID');
            _this._measurements['fid'] = { value: metric.value };
            _this._measurements['mark.fid'] = { value: timeOrigin + startTime };
        });
    };
    return MetricsInstrumentation;
}());
export { MetricsInstrumentation };
/** Instrument navigation entries */
function addNavigationSpans(transaction, entry, timeOrigin) {
    addPerformanceNavigationTiming({ transaction: transaction, entry: entry, event: 'unloadEvent', timeOrigin: timeOrigin });
    addPerformanceNavigationTiming({ transaction: transaction, entry: entry, event: 'redirect', timeOrigin: timeOrigin });
    addPerformanceNavigationTiming({ transaction: transaction, entry: entry, event: 'domContentLoadedEvent', timeOrigin: timeOrigin });
    addPerformanceNavigationTiming({ transaction: transaction, entry: entry, event: 'loadEvent', timeOrigin: timeOrigin });
    addPerformanceNavigationTiming({ transaction: transaction, entry: entry, event: 'connect', timeOrigin: timeOrigin });
    addPerformanceNavigationTiming({
        transaction: transaction,
        entry: entry,
        event: 'secureConnection',
        timeOrigin: timeOrigin,
        eventEnd: 'connectEnd',
        description: 'TLS/SSL',
    });
    addPerformanceNavigationTiming({
        transaction: transaction,
        entry: entry,
        event: 'fetch',
        timeOrigin: timeOrigin,
        eventEnd: 'domainLookupStart',
        description: 'cache',
    });
    addPerformanceNavigationTiming({ transaction: transaction, entry: entry, event: 'domainLookup', timeOrigin: timeOrigin, description: 'DNS' });
    addRequest(transaction, entry, timeOrigin);
}
/** Create measure related spans */
function addMeasureSpans(transaction, entry, startTime, duration, timeOrigin) {
    var measureStartTimestamp = timeOrigin + startTime;
    var measureEndTimestamp = measureStartTimestamp + duration;
    _startChild(transaction, {
        description: entry.name,
        endTimestamp: measureEndTimestamp,
        op: entry.entryType,
        startTimestamp: measureStartTimestamp,
    });
    return measureStartTimestamp;
}
/** Create resource-related spans */
export function addResourceSpans(transaction, entry, resourceName, startTime, duration, timeOrigin) {
    // we already instrument based on fetch and xhr, so we don't need to
    // duplicate spans here.
    if (entry.initiatorType === 'xmlhttprequest' || entry.initiatorType === 'fetch') {
        return undefined;
    }
    var data = {};
    if ('transferSize' in entry) {
        data['Transfer Size'] = entry.transferSize;
    }
    if ('encodedBodySize' in entry) {
        data['Encoded Body Size'] = entry.encodedBodySize;
    }
    if ('decodedBodySize' in entry) {
        data['Decoded Body Size'] = entry.decodedBodySize;
    }
    var startTimestamp = timeOrigin + startTime;
    var endTimestamp = startTimestamp + duration;
    _startChild(transaction, {
        description: resourceName,
        endTimestamp: endTimestamp,
        op: entry.initiatorType ? "resource." + entry.initiatorType : 'resource',
        startTimestamp: startTimestamp,
        data: data,
    });
    return endTimestamp;
}
/** Create performance navigation related spans */
function addPerformanceNavigationTiming(props) {
    var transaction = props.transaction, entry = props.entry, event = props.event, timeOrigin = props.timeOrigin, eventEnd = props.eventEnd, description = props.description;
    var end = eventEnd ? entry[eventEnd] : entry[event + "End"];
    var start = entry[event + "Start"];
    if (!start || !end) {
        return;
    }
    _startChild(transaction, {
        op: 'browser',
        description: (description !== null && description !== void 0 ? description : event),
        startTimestamp: timeOrigin + msToSec(start),
        endTimestamp: timeOrigin + msToSec(end),
    });
}
/** Create request and response related spans */
function addRequest(transaction, entry, timeOrigin) {
    _startChild(transaction, {
        op: 'browser',
        description: 'request',
        startTimestamp: timeOrigin + msToSec(entry.requestStart),
        endTimestamp: timeOrigin + msToSec(entry.responseEnd),
    });
    _startChild(transaction, {
        op: 'browser',
        description: 'response',
        startTimestamp: timeOrigin + msToSec(entry.responseStart),
        endTimestamp: timeOrigin + msToSec(entry.responseEnd),
    });
}
/**
 * Helper function to start child on transactions. This function will make sure that the transaction will
 * use the start timestamp of the created child span if it is earlier than the transactions actual
 * start timestamp.
 */
export function _startChild(transaction, _a) {
    var startTimestamp = _a.startTimestamp, ctx = __rest(_a, ["startTimestamp"]);
    if (startTimestamp && transaction.startTimestamp > startTimestamp) {
        transaction.startTimestamp = startTimestamp;
    }
    return transaction.startChild(__assign({ startTimestamp: startTimestamp }, ctx));
}
/**
 * Checks if a given value is a valid measurement value.
 */
function isMeasurementValue(value) {
    return typeof value === 'number' && isFinite(value);
}
//# sourceMappingURL=metrics.js.map