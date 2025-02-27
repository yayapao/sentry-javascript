import { BrowserTracing } from '@sentry/tracing';
import { NextjsOptions } from './utils/nextjsOptions';
export * from '@sentry/react';
export { nextRouterInstrumentation } from './performance/client';
export declare const Integrations: {
    BrowserTracing: typeof BrowserTracing;
    GlobalHandlers: typeof import("@sentry/browser/dist/integrations").GlobalHandlers;
    TryCatch: typeof import("@sentry/browser/dist/integrations").TryCatch;
    Breadcrumbs: typeof import("@sentry/browser/dist/integrations").Breadcrumbs;
    LinkedErrors: typeof import("@sentry/browser/dist/integrations").LinkedErrors;
    UserAgent: typeof import("@sentry/browser/dist/integrations").UserAgent;
    Dedupe: typeof import("@sentry/browser/dist/integrations").Dedupe;
    FunctionToString: typeof import("@sentry/core/dist/integrations").FunctionToString;
    InboundFilters: typeof import("@sentry/core/dist/integrations").InboundFilters;
};
/** Inits the Sentry NextJS SDK on the browser with the React SDK. */
export declare function init(options: NextjsOptions): void;
//# sourceMappingURL=index.client.d.ts.map