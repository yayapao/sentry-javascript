import { CloudEventFunction, CloudEventFunctionWithCallback, WrapperOptions } from './general';
export declare type CloudEventFunctionWrapperOptions = WrapperOptions;
/**
 * Wraps an event function handler adding it error capture and tracing capabilities.
 *
 * @param fn Event handler
 * @param options Options
 * @returns Event handler
 */
export declare function wrapCloudEventFunction(fn: CloudEventFunction | CloudEventFunctionWithCallback, wrapOptions?: Partial<CloudEventFunctionWrapperOptions>): CloudEventFunctionWithCallback;
//# sourceMappingURL=cloud_events.d.ts.map