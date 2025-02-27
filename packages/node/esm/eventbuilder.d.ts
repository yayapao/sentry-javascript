import { Event, EventHint, Options, SeverityLevel } from '@sentry/types';
/**
 * Builds and Event from a Exception
 * @hidden
 */
export declare function eventFromException(options: Options, exception: unknown, hint?: EventHint): PromiseLike<Event>;
/**
 * Builds and Event from a Message
 * @hidden
 */
export declare function eventFromMessage(options: Options, message: string, level?: SeverityLevel, hint?: EventHint): PromiseLike<Event>;
//# sourceMappingURL=eventbuilder.d.ts.map