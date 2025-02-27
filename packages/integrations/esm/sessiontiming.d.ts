import { Event, EventProcessor, Hub, Integration } from '@sentry/types';
/** This function adds duration since Sentry was initialized till the time event was sent */
export declare class SessionTiming implements Integration {
    /**
     * @inheritDoc
     */
    static id: string;
    /**
     * @inheritDoc
     */
    name: string;
    /** Exact time Client was initialized expressed in milliseconds since Unix Epoch. */
    protected readonly _startTime: number;
    /**
     * @inheritDoc
     */
    setupOnce(addGlobalEventProcessor: (callback: EventProcessor) => void, getCurrentHub: () => Hub): void;
    /**
     * @inheritDoc
     */
    process(event: Event): Event;
}
//# sourceMappingURL=sessiontiming.d.ts.map