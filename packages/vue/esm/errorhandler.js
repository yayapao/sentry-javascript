import { getCurrentHub } from '@sentry/browser';
import { formatComponentName, generateComponentTrace } from './components';
export var attachErrorHandler = function (app, options) {
    var _a = app.config, errorHandler = _a.errorHandler, warnHandler = _a.warnHandler, silent = _a.silent;
    app.config.errorHandler = function (error, vm, lifecycleHook) {
        var componentName = formatComponentName(vm, false);
        var trace = vm ? generateComponentTrace(vm) : '';
        var metadata = {
            componentName: componentName,
            lifecycleHook: lifecycleHook,
            trace: trace,
        };
        if (vm && options.attachProps) {
            // Vue2 - $options.propsData
            // Vue3 - $props
            metadata.propsData = vm.$options.propsData || vm.$props;
        }
        // Capture exception in the next event loop, to make sure that all breadcrumbs are recorded in time.
        setTimeout(function () {
            getCurrentHub().withScope(function (scope) {
                scope.setContext('vue', metadata);
                getCurrentHub().captureException(error);
            });
        });
        if (typeof errorHandler === 'function') {
            errorHandler.call(app, error, vm, lifecycleHook);
        }
        if (options.logErrors) {
            var hasConsole = typeof console !== 'undefined';
            var message = "Error in " + lifecycleHook + ": \"" + (error && error.toString()) + "\"";
            if (warnHandler) {
                warnHandler.call(null, message, vm, trace);
            }
            else if (hasConsole && !silent) {
                // eslint-disable-next-line no-console
                console.error("[Vue warn]: " + message + trace);
            }
        }
    };
};
//# sourceMappingURL=errorhandler.js.map