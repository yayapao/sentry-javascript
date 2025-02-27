import { __assign, __extends } from "tslib";
import { BaseBackend } from '@sentry/core';
import { makeDsn } from '@sentry/utils';
import { eventFromException, eventFromMessage } from './eventbuilder';
import { HTTPSTransport, HTTPTransport } from './transports';
/**
 * The Sentry Node SDK Backend.
 * @hidden
 */
var NodeBackend = /** @class */ (function (_super) {
    __extends(NodeBackend, _super);
    function NodeBackend() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * @inheritDoc
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    NodeBackend.prototype.eventFromException = function (exception, hint) {
        return eventFromException(this._options, exception, hint);
    };
    /**
     * @inheritDoc
     */
    NodeBackend.prototype.eventFromMessage = function (message, level, hint) {
        if (level === void 0) { level = 'info'; }
        return eventFromMessage(this._options, message, level, hint);
    };
    /**
     * @inheritDoc
     */
    NodeBackend.prototype._setupTransport = function () {
        if (!this._options.dsn) {
            // We return the noop transport here in case there is no Dsn.
            return _super.prototype._setupTransport.call(this);
        }
        var dsn = makeDsn(this._options.dsn);
        var transportOptions = __assign(__assign(__assign(__assign(__assign({}, this._options.transportOptions), (this._options.httpProxy && { httpProxy: this._options.httpProxy })), (this._options.httpsProxy && { httpsProxy: this._options.httpsProxy })), (this._options.caCerts && { caCerts: this._options.caCerts })), { dsn: this._options.dsn, tunnel: this._options.tunnel, _metadata: this._options._metadata });
        if (this._options.transport) {
            return new this._options.transport(transportOptions);
        }
        if (dsn.protocol === 'http') {
            return new HTTPTransport(transportOptions);
        }
        return new HTTPSTransport(transportOptions);
    };
    return NodeBackend;
}(BaseBackend));
export { NodeBackend };
//# sourceMappingURL=backend.js.map