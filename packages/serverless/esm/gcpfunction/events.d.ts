import { EventFunction, EventFunctionWithCallback, WrapperOptions } from './general';
export declare type EventFunctionWrapperOptions = WrapperOptions;
/**
 * Wraps an event function handler adding it error capture and tracing capabilities.
 *
 * @param fn Event handler
 * @param options Options
 * @returns Event handler
 */
export declare function wrapEventFunction(fn: EventFunction | EventFunctionWithCallback, wrapOptions?: Partial<EventFunctionWrapperOptions>): EventFunctionWithCallback;
//# sourceMappingURL=events.d.ts.map