import { __assign } from "tslib";
import { getCurrentHub } from '@sentry/hub';
import { addExceptionMechanism, addExceptionTypeValue, extractExceptionKeysForMessage, isError, isPlainObject, normalizeToSize, SyncPromise, } from '@sentry/utils';
import { extractStackFromError, parseError, parseStack, prepareFramesForEvent } from './parsers';
/**
 * Builds and Event from a Exception
 * @hidden
 */
export function eventFromException(options, exception, hint) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var ex = exception;
    var providedMechanism = hint && hint.data && hint.data.mechanism;
    var mechanism = providedMechanism || {
        handled: true,
        type: 'generic',
    };
    if (!isError(exception)) {
        if (isPlainObject(exception)) {
            // This will allow us to group events based on top-level keys
            // which is much better than creating new group when any key/value change
            var message = "Non-Error exception captured with keys: " + extractExceptionKeysForMessage(exception);
            getCurrentHub().configureScope(function (scope) {
                scope.setExtra('__serialized__', normalizeToSize(exception));
            });
            ex = (hint && hint.syntheticException) || new Error(message);
            ex.message = message;
        }
        else {
            // This handles when someone does: `throw "something awesome";`
            // We use synthesized Error here so we can extract a (rough) stack trace.
            ex = (hint && hint.syntheticException) || new Error(exception);
            ex.message = exception;
        }
        mechanism.synthetic = true;
    }
    return new SyncPromise(function (resolve, reject) {
        return parseError(ex, options)
            .then(function (event) {
            addExceptionTypeValue(event, undefined, undefined);
            addExceptionMechanism(event, mechanism);
            resolve(__assign(__assign({}, event), { event_id: hint && hint.event_id }));
        })
            .then(null, reject);
    });
}
/**
 * Builds and Event from a Message
 * @hidden
 */
export function eventFromMessage(options, message, level, hint) {
    if (level === void 0) { level = 'info'; }
    var event = {
        event_id: hint && hint.event_id,
        level: level,
        message: message,
    };
    return new SyncPromise(function (resolve) {
        if (options.attachStacktrace && hint && hint.syntheticException) {
            var stack = hint.syntheticException ? extractStackFromError(hint.syntheticException) : [];
            void parseStack(stack, options)
                .then(function (frames) {
                event.stacktrace = {
                    frames: prepareFramesForEvent(frames),
                };
                resolve(event);
            })
                .then(null, function () {
                resolve(event);
            });
        }
        else {
            resolve(event);
        }
    });
}
//# sourceMappingURL=eventbuilder.js.map