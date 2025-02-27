import { Event, EventProcessor, Hub, Integration, StackFrame } from '@sentry/types';
declare type StackFrameIteratee = (frame: StackFrame) => StackFrame;
/** Rewrite event frames paths */
export declare class RewriteFrames implements Integration {
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
    private readonly _root?;
    /**
     * @inheritDoc
     */
    private readonly _prefix;
    /**
     * @inheritDoc
     */
    constructor(options?: {
        root?: string;
        prefix?: string;
        iteratee?: StackFrameIteratee;
    });
    /**
     * @inheritDoc
     */
    setupOnce(addGlobalEventProcessor: (callback: EventProcessor) => void, getCurrentHub: () => Hub): void;
    /** JSDoc */
    process(originalEvent: Event): Event;
    /**
     * @inheritDoc
     */
    private readonly _iteratee;
    /** JSDoc */
    private _processExceptionsEvent;
    /** JSDoc */
    private _processStacktraceEvent;
    /** JSDoc */
    private _processStacktrace;
}
export {};
//# sourceMappingURL=rewriteframes.d.ts.map