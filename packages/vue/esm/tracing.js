import { __values } from "tslib";
import { getCurrentHub } from '@sentry/browser';
import { logger, timestampInSeconds } from '@sentry/utils';
import { formatComponentName } from './components';
import { DEFAULT_HOOKS } from './constants';
var VUE_OP = 'ui.vue';
// Mappings from operation to corresponding lifecycle hook.
var HOOKS = {
    activate: ['activated', 'deactivated'],
    create: ['beforeCreate', 'created'],
    destroy: ['beforeDestroy', 'destroyed'],
    mount: ['beforeMount', 'mounted'],
    update: ['beforeUpdate', 'updated'],
};
/** Grabs active transaction off scope, if any */
function getActiveTransaction() {
    var _a;
    return (_a = getCurrentHub()
        .getScope()) === null || _a === void 0 ? void 0 : _a.getTransaction();
}
/** Finish top-level span and activity with a debounce configured using `timeout` option */
function finishRootSpan(vm, timestamp, timeout) {
    if (vm.$_sentryRootSpanTimer) {
        clearTimeout(vm.$_sentryRootSpanTimer);
    }
    vm.$_sentryRootSpanTimer = setTimeout(function () {
        var _a;
        if ((_a = vm.$root) === null || _a === void 0 ? void 0 : _a.$_sentryRootSpan) {
            vm.$root.$_sentryRootSpan.finish(timestamp);
            vm.$root.$_sentryRootSpan = undefined;
        }
    }, timeout);
}
export var createTracingMixins = function (options) {
    var e_1, _a;
    var hooks = (options.hooks || [])
        .concat(DEFAULT_HOOKS)
        // Removing potential duplicates
        .filter(function (value, index, self) { return self.indexOf(value) === index; });
    var mixins = {};
    var _loop_1 = function (operation) {
        var e_2, _a;
        // Retrieve corresponding hooks from Vue lifecycle.
        // eg. mount => ['beforeMount', 'mounted']
        var internalHooks = HOOKS[operation];
        if (!internalHooks) {
            logger.warn("Unknown hook: " + operation);
            return "continue";
        }
        try {
            for (var internalHooks_1 = (e_2 = void 0, __values(internalHooks)), internalHooks_1_1 = internalHooks_1.next(); !internalHooks_1_1.done; internalHooks_1_1 = internalHooks_1.next()) {
                var internalHook = internalHooks_1_1.value;
                mixins[internalHook] = function () {
                    var _a;
                    var isRoot = this.$root === this;
                    if (isRoot) {
                        var activeTransaction = getActiveTransaction();
                        if (activeTransaction) {
                            this.$_sentryRootSpan =
                                this.$_sentryRootSpan ||
                                    activeTransaction.startChild({
                                        description: 'Application Render',
                                        op: VUE_OP,
                                    });
                        }
                    }
                    // Skip components that we don't want to track to minimize the noise and give a more granular control to the user
                    var name = formatComponentName(this, false);
                    var shouldTrack = Array.isArray(options.trackComponents)
                        ? options.trackComponents.includes(name)
                        : options.trackComponents;
                    // We always want to track root component
                    if (!isRoot && !shouldTrack) {
                        return;
                    }
                    this.$_sentrySpans = this.$_sentrySpans || {};
                    // On the first handler call (before), it'll be undefined, as `$once` will add it in the future.
                    // However, on the second call (after), it'll be already in place.
                    var span = this.$_sentrySpans[operation];
                    if (span) {
                        span.finish();
                        finishRootSpan(this, timestampInSeconds(), options.timeout);
                    }
                    else {
                        var activeTransaction = ((_a = this.$root) === null || _a === void 0 ? void 0 : _a.$_sentryRootSpan) || getActiveTransaction();
                        if (activeTransaction) {
                            this.$_sentrySpans[operation] = activeTransaction.startChild({
                                description: "Vue <" + name + ">",
                                op: VUE_OP + "." + operation,
                            });
                        }
                    }
                };
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (internalHooks_1_1 && !internalHooks_1_1.done && (_a = internalHooks_1.return)) _a.call(internalHooks_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    try {
        for (var hooks_1 = __values(hooks), hooks_1_1 = hooks_1.next(); !hooks_1_1.done; hooks_1_1 = hooks_1.next()) {
            var operation = hooks_1_1.value;
            _loop_1(operation);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (hooks_1_1 && !hooks_1_1.done && (_a = hooks_1.return)) _a.call(hooks_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return mixins;
};
//# sourceMappingURL=tracing.js.map