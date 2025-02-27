import { Event, EventProcessor, Hub, Integration } from '@sentry/types';
/** Deduplication filter */
export declare class Dedupe implements Integration {
    /**
     * @inheritDoc
     */
    static id: string;
    /**
     * @inheritDoc
     */
    name: string;
    /**
     * @inheritDoc
     */
    private _previousEvent?;
    /**
     * @inheritDoc
     */
    setupOnce(addGlobalEventProcessor: (callback: EventProcessor) => void, getCurrentHub: () => Hub): void;
}
/** JSDoc */
export declare function _shouldDropEvent(currentEvent: Event, previousEvent?: Event): boolean;
//# sourceMappingURL=dedupe.d.ts.map