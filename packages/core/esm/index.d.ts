export { addBreadcrumb, captureException, captureEvent, captureMessage, configureScope, startTransaction, setContext, setExtra, setExtras, setTag, setTags, setUser, withScope, } from '@sentry/minimal';
export { addGlobalEventProcessor, getCurrentHub, getHubFromCarrier, Hub, makeMain, Scope } from '@sentry/hub';
export { API, APIDetails, getEnvelopeEndpointWithUrlEncodedAuth, getStoreEndpointWithUrlEncodedAuth, getRequestHeaders, initAPIDetails, getReportDialogEndpoint, } from './api';
export { BaseClient } from './baseclient';
export { BackendClass, BaseBackend } from './basebackend';
export { eventToSentryRequest, sessionToSentryRequest } from './request';
export { initAndBind, ClientClass } from './sdk';
export { NoopTransport } from './transports/noop';
export { SDK_VERSION } from './version';
import * as Integrations from './integrations';
export { Integrations };
//# sourceMappingURL=index.d.ts.map