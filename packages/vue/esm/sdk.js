import { __assign } from "tslib";
import { init as browserInit, SDK_VERSION } from '@sentry/browser';
import { getGlobalObject, logger } from '@sentry/utils';
import { DEFAULT_HOOKS } from './constants';
import { attachErrorHandler } from './errorhandler';
import { createTracingMixins } from './tracing';
var DEFAULT_CONFIG = {
    Vue: getGlobalObject().Vue,
    attachProps: true,
    logErrors: false,
    hooks: DEFAULT_HOOKS,
    timeout: 2000,
    trackComponents: false,
    _metadata: {
        sdk: {
            name: 'sentry.javascript.vue',
            packages: [
                {
                    name: 'npm:@sentry/vue',
                    version: SDK_VERSION,
                },
            ],
            version: SDK_VERSION,
        },
    },
};
/**
 * Inits the Vue SDK
 */
export function init(config) {
    if (config === void 0) { config = {}; }
    var options = __assign(__assign({}, DEFAULT_CONFIG), config);
    browserInit(options);
    if (!options.Vue && !options.app) {
        logger.warn('Misconfigured SDK. Vue specific errors will not be captured.\n' +
            'Update your `Sentry.init` call with an appropriate config option:\n' +
            '`app` (Application Instance - Vue 3) or `Vue` (Vue Constructor - Vue 2).');
        return;
    }
    if (options.Vue) {
        vueInit(options.Vue, options);
    }
    else if (options.app) {
        var apps = Array.isArray(options.app) ? options.app : [options.app];
        apps.forEach(function (app) { return vueInit(app, options); });
    }
}
var vueInit = function (app, options) {
    attachErrorHandler(app, options);
    if ('tracesSampleRate' in options || 'tracesSampler' in options) {
        app.mixin(createTracingMixins(__assign(__assign({}, options), options.tracingOptions)));
    }
};
//# sourceMappingURL=sdk.js.map