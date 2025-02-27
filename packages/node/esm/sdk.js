import { __awaiter, __generator, __read, __spread } from "tslib";
import { getCurrentHub, initAndBind, Integrations as CoreIntegrations } from '@sentry/core';
import { getMainCarrier, setHubOnCarrier } from '@sentry/hub';
import { getGlobalObject, logger } from '@sentry/utils';
import * as domain from 'domain';
import { NodeClient } from './client';
import { Console, Http, LinkedErrors, OnUncaughtException, OnUnhandledRejection } from './integrations';
export var defaultIntegrations = [
    // Common
    new CoreIntegrations.InboundFilters(),
    new CoreIntegrations.FunctionToString(),
    // Native Wrappers
    new Console(),
    new Http(),
    // Global Handlers
    new OnUncaughtException(),
    new OnUnhandledRejection(),
    // Misc
    new LinkedErrors(),
];
/**
 * The Sentry Node SDK Client.
 *
 * To use this SDK, call the {@link init} function as early as possible in the
 * main entry module. To set context information or send manual events, use the
 * provided methods.
 *
 * @example
 * ```
 *
 * const { init } = require('@sentry/node');
 *
 * init({
 *   dsn: '__DSN__',
 *   // ...
 * });
 * ```
 *
 * @example
 * ```
 *
 * const { configureScope } = require('@sentry/node');
 * configureScope((scope: Scope) => {
 *   scope.setExtra({ battery: 0.7 });
 *   scope.setTag({ user_mode: 'admin' });
 *   scope.setUser({ id: '4711' });
 * });
 * ```
 *
 * @example
 * ```
 *
 * const { addBreadcrumb } = require('@sentry/node');
 * addBreadcrumb({
 *   message: 'My Breadcrumb',
 *   // ...
 * });
 * ```
 *
 * @example
 * ```
 *
 * const Sentry = require('@sentry/node');
 * Sentry.captureMessage('Hello, world!');
 * Sentry.captureException(new Error('Good bye'));
 * Sentry.captureEvent({
 *   message: 'Manual',
 *   stacktrace: [
 *     // ...
 *   ],
 * });
 * ```
 *
 * @see {@link NodeOptions} for documentation on configuration options.
 */
export function init(options) {
    if (options === void 0) { options = {}; }
    var _a;
    var carrier = getMainCarrier();
    var autoloadedIntegrations = ((_a = carrier.__SENTRY__) === null || _a === void 0 ? void 0 : _a.integrations) || [];
    options.defaultIntegrations =
        options.defaultIntegrations === false
            ? []
            : __spread((Array.isArray(options.defaultIntegrations) ? options.defaultIntegrations : defaultIntegrations), autoloadedIntegrations);
    if (options.dsn === undefined && process.env.SENTRY_DSN) {
        options.dsn = process.env.SENTRY_DSN;
    }
    if (options.tracesSampleRate === undefined && process.env.SENTRY_TRACES_SAMPLE_RATE) {
        var tracesSampleRate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE);
        if (isFinite(tracesSampleRate)) {
            options.tracesSampleRate = tracesSampleRate;
        }
    }
    if (options.release === undefined) {
        var detectedRelease = getSentryRelease();
        if (detectedRelease !== undefined) {
            options.release = detectedRelease;
        }
        else {
            // If release is not provided, then we should disable autoSessionTracking
            options.autoSessionTracking = false;
        }
    }
    if (options.environment === undefined && process.env.SENTRY_ENVIRONMENT) {
        options.environment = process.env.SENTRY_ENVIRONMENT;
    }
    if (options.autoSessionTracking === undefined && options.dsn !== undefined) {
        options.autoSessionTracking = true;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    if (domain.active) {
        setHubOnCarrier(carrier, getCurrentHub());
    }
    initAndBind(NodeClient, options);
    if (options.autoSessionTracking) {
        startSessionTracking();
    }
}
/**
 * This is the getter for lastEventId.
 *
 * @returns The last event id of a captured event.
 */
export function lastEventId() {
    return getCurrentHub().lastEventId();
}
/**
 * Call `flush()` on the current client, if there is one. See {@link Client.flush}.
 *
 * @param timeout Maximum time in ms the client should wait to flush its event queue. Omitting this parameter will cause
 * the client to wait until all events are sent before resolving the promise.
 * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
 * doesn't (or if there's no client defined).
 */
export function flush(timeout) {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            client = getCurrentHub().getClient();
            if (client) {
                return [2 /*return*/, client.flush(timeout)];
            }
            logger.warn('Cannot flush events. No client defined.');
            return [2 /*return*/, Promise.resolve(false)];
        });
    });
}
/**
 * Call `close()` on the current client, if there is one. See {@link Client.close}.
 *
 * @param timeout Maximum time in ms the client should wait to flush its event queue before shutting down. Omitting this
 * parameter will cause the client to wait until all events are sent before disabling itself.
 * @returns A promise which resolves to `true` if the queue successfully drains before the timeout, or `false` if it
 * doesn't (or if there's no client defined).
 */
export function close(timeout) {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            client = getCurrentHub().getClient();
            if (client) {
                return [2 /*return*/, client.close(timeout)];
            }
            logger.warn('Cannot flush events and disable SDK. No client defined.');
            return [2 /*return*/, Promise.resolve(false)];
        });
    });
}
/**
 * Function that takes an instance of NodeClient and checks if autoSessionTracking option is enabled for that client
 */
export function isAutoSessionTrackingEnabled(client) {
    if (client === undefined) {
        return false;
    }
    var clientOptions = client && client.getOptions();
    if (clientOptions && clientOptions.autoSessionTracking !== undefined) {
        return clientOptions.autoSessionTracking;
    }
    return false;
}
/**
 * Returns a release dynamically from environment variables.
 */
export function getSentryRelease(fallback) {
    // Always read first as Sentry takes this as precedence
    if (process.env.SENTRY_RELEASE) {
        return process.env.SENTRY_RELEASE;
    }
    // This supports the variable that sentry-webpack-plugin injects
    var global = getGlobalObject();
    if (global.SENTRY_RELEASE && global.SENTRY_RELEASE.id) {
        return global.SENTRY_RELEASE.id;
    }
    return (
    // GitHub Actions - https://help.github.com/en/actions/configuring-and-managing-workflows/using-environment-variables#default-environment-variables
    process.env.GITHUB_SHA ||
        // Netlify - https://docs.netlify.com/configure-builds/environment-variables/#build-metadata
        process.env.COMMIT_REF ||
        // Vercel - https://vercel.com/docs/v2/build-step#system-environment-variables
        process.env.VERCEL_GIT_COMMIT_SHA ||
        process.env.VERCEL_GITHUB_COMMIT_SHA ||
        process.env.VERCEL_GITLAB_COMMIT_SHA ||
        process.env.VERCEL_BITBUCKET_COMMIT_SHA ||
        // Zeit (now known as Vercel)
        process.env.ZEIT_GITHUB_COMMIT_SHA ||
        process.env.ZEIT_GITLAB_COMMIT_SHA ||
        process.env.ZEIT_BITBUCKET_COMMIT_SHA ||
        fallback);
}
/**
 * Enable automatic Session Tracking for the node process.
 */
function startSessionTracking() {
    var hub = getCurrentHub();
    hub.startSession();
    // Emitted in the case of healthy sessions, error of `mechanism.handled: true` and unhandledrejections because
    // The 'beforeExit' event is not emitted for conditions causing explicit termination,
    // such as calling process.exit() or uncaught exceptions.
    // Ref: https://nodejs.org/api/process.html#process_event_beforeexit
    process.on('beforeExit', function () {
        var _a;
        var session = (_a = hub.getScope()) === null || _a === void 0 ? void 0 : _a.getSession();
        var terminalStates = ['exited', 'crashed'];
        // Only call endSession, if the Session exists on Scope and SessionStatus is not a
        // Terminal Status i.e. Exited or Crashed because
        // "When a session is moved away from ok it must not be updated anymore."
        // Ref: https://develop.sentry.dev/sdk/sessions/
        if (session && !terminalStates.includes(session.status))
            hub.endSession();
    });
}
//# sourceMappingURL=sdk.js.map