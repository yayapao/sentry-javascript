import { APIDetails } from '@sentry/core';
import { Event, Outcome, Response as SentryResponse, SentryRequest, SentryRequestType, Session, Transport, TransportOptions } from '@sentry/types';
import { PromiseBuffer } from '@sentry/utils';
/** Base Transport class implementation */
export declare abstract class BaseTransport implements Transport {
    options: TransportOptions;
    /**
     * @deprecated
     */
    url: string;
    /** Helper to get Sentry API endpoints. */
    protected readonly _api: APIDetails;
    /** A simple buffer holding all requests. */
    protected readonly _buffer: PromiseBuffer<SentryResponse>;
    /** Locks transport after receiving rate limits in a response */
    protected readonly _rateLimits: Record<string, Date>;
    protected _outcomes: {
        [key: string]: number;
    };
    constructor(options: TransportOptions);
    /**
     * @inheritDoc
     */
    sendEvent(event: Event): PromiseLike<SentryResponse>;
    /**
     * @inheritDoc
     */
    sendSession(session: Session): PromiseLike<SentryResponse>;
    /**
     * @inheritDoc
     */
    close(timeout?: number): PromiseLike<boolean>;
    /**
     * @inheritDoc
     */
    recordLostEvent(reason: Outcome, category: SentryRequestType): void;
    /**
     * Send outcomes as an envelope
     */
    protected _flushOutcomes(): void;
    /**
     * Handle Sentry repsonse for promise-based transports.
     */
    protected _handleResponse({ requestType, response, headers, resolve, reject, }: {
        requestType: SentryRequestType;
        response: Response | XMLHttpRequest;
        headers: Record<string, string | null>;
        resolve: (value?: SentryResponse | PromiseLike<SentryResponse> | null | undefined) => void;
        reject: (reason?: unknown) => void;
    }): void;
    /**
     * Gets the time that given category is disabled until for rate limiting
     */
    protected _disabledUntil(requestType: SentryRequestType): Date;
    /**
     * Checks if a category is rate limited
     */
    protected _isRateLimited(requestType: SentryRequestType): boolean;
    /**
     * Sets internal _rateLimits from incoming headers. Returns true if headers contains a non-empty rate limiting header.
     */
    protected _handleRateLimit(headers: Record<string, string | null>): boolean;
    protected abstract _sendRequest(sentryRequest: SentryRequest, originalPayload: Event | Session): PromiseLike<SentryResponse>;
}
//# sourceMappingURL=base.d.ts.map