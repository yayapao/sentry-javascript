import { __assign, __extends } from "tslib";
import { captureException, showReportDialog, withScope } from '@sentry/browser';
import { logger } from '@sentry/utils';
import hoistNonReactStatics from 'hoist-non-react-statics';
import * as React from 'react';
export function isAtLeastReact17(version) {
    var major = version.match(/^([^.]+)/);
    return major !== null && parseInt(major[0]) >= 17;
}
export var UNKNOWN_COMPONENT = 'unknown';
var INITIAL_STATE = {
    componentStack: null,
    error: null,
    eventId: null,
};
/**
 * A ErrorBoundary component that logs errors to Sentry. Requires React >= 16.
 * NOTE: If you are a Sentry user, and you are seeing this stack frame, it means the
 * Sentry React SDK ErrorBoundary caught an error invoking your application code. This
 * is expected behavior and NOT indicative of a bug with the Sentry React SDK.
 */
var ErrorBoundary = /** @class */ (function (_super) {
    __extends(ErrorBoundary, _super);
    function ErrorBoundary() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = INITIAL_STATE;
        _this.resetErrorBoundary = function () {
            var onReset = _this.props.onReset;
            var _a = _this.state, error = _a.error, componentStack = _a.componentStack, eventId = _a.eventId;
            if (onReset) {
                onReset(error, componentStack, eventId);
            }
            _this.setState(INITIAL_STATE);
        };
        return _this;
    }
    ErrorBoundary.prototype.componentDidCatch = function (error, _a) {
        var _this = this;
        var componentStack = _a.componentStack;
        var _b = this.props, beforeCapture = _b.beforeCapture, onError = _b.onError, showDialog = _b.showDialog, dialogOptions = _b.dialogOptions;
        withScope(function (scope) {
            // If on React version >= 17, create stack trace from componentStack param and links
            // to to the original error using `error.cause` otherwise relies on error param for stacktrace.
            // Linking errors requires the `LinkedErrors` integration be enabled.
            if (isAtLeastReact17(React.version)) {
                var errorBoundaryError = new Error(error.message);
                errorBoundaryError.name = "React ErrorBoundary " + errorBoundaryError.name;
                errorBoundaryError.stack = componentStack;
                // Using the `LinkedErrors` integration to link the errors together.
                error.cause = errorBoundaryError;
            }
            if (beforeCapture) {
                beforeCapture(scope, error, componentStack);
            }
            var eventId = captureException(error, { contexts: { react: { componentStack: componentStack } } });
            if (onError) {
                onError(error, componentStack, eventId);
            }
            if (showDialog) {
                showReportDialog(__assign(__assign({}, dialogOptions), { eventId: eventId }));
            }
            // componentDidCatch is used over getDerivedStateFromError
            // so that componentStack is accessible through state.
            _this.setState({ error: error, componentStack: componentStack, eventId: eventId });
        });
    };
    ErrorBoundary.prototype.componentDidMount = function () {
        var onMount = this.props.onMount;
        if (onMount) {
            onMount();
        }
    };
    ErrorBoundary.prototype.componentWillUnmount = function () {
        var _a = this.state, error = _a.error, componentStack = _a.componentStack, eventId = _a.eventId;
        var onUnmount = this.props.onUnmount;
        if (onUnmount) {
            onUnmount(error, componentStack, eventId);
        }
    };
    ErrorBoundary.prototype.render = function () {
        var _a = this.props, fallback = _a.fallback, children = _a.children;
        var _b = this.state, error = _b.error, componentStack = _b.componentStack, eventId = _b.eventId;
        if (error) {
            var element = undefined;
            if (typeof fallback === 'function') {
                element = fallback({ error: error, componentStack: componentStack, resetError: this.resetErrorBoundary, eventId: eventId });
            }
            else {
                element = fallback;
            }
            if (React.isValidElement(element)) {
                return element;
            }
            if (fallback) {
                logger.warn('fallback did not produce a valid ReactElement');
            }
            // Fail gracefully if no fallback provided or is not valid
            return null;
        }
        if (typeof children === 'function') {
            return children();
        }
        return children;
    };
    return ErrorBoundary;
}(React.Component));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withErrorBoundary(WrappedComponent, errorBoundaryOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    var componentDisplayName = WrappedComponent.displayName || WrappedComponent.name || UNKNOWN_COMPONENT;
    var Wrapped = function (props) { return (React.createElement(ErrorBoundary, __assign({}, errorBoundaryOptions),
        React.createElement(WrappedComponent, __assign({}, props)))); };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    Wrapped.displayName = "errorBoundary(" + componentDisplayName + ")";
    // Copy over static methods from Wrapped component to Profiler HOC
    // See: https://reactjs.org/docs/higher-order-components.html#static-methods-must-be-copied-over
    hoistNonReactStatics(Wrapped, WrappedComponent);
    return Wrapped;
}
export { ErrorBoundary, withErrorBoundary };
//# sourceMappingURL=errorboundary.js.map