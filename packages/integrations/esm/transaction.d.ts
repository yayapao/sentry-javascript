import { Event, EventProcessor, Hub, Integration } from '@sentry/types';
/** Add node transaction to the event */
export declare class Transaction implements Integration {
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
    setupOnce(addGlobalEventProcessor: (callback: EventProcessor) => void, getCurrentHub: () => Hub): void;
    /**
     * @inheritDoc
     */
    process(event: Event): Event;
    /** JSDoc */
    private _getFramesFromEvent;
    /** JSDoc */
    private _getTransaction;
}
//# sourceMappingURL=transaction.d.ts.map