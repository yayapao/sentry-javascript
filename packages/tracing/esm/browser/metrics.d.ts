import { SpanContext } from '@sentry/types';
import { Span } from '../span';
import { Transaction } from '../transaction';
/** Class tracking metrics  */
export declare class MetricsInstrumentation {
    private _reportAllChanges;
    private _measurements;
    private _performanceCursor;
    private _lcpEntry;
    private _clsEntry;
    constructor(_reportAllChanges?: boolean);
    /** Add performance related spans to a transaction */
    addPerformanceEntries(transaction: Transaction): void;
    /** Add LCP / CLS data to transaction to allow debugging */
    private _tagMetricInfo;
    /** Starts tracking the Cumulative Layout Shift on the current page. */
    private _trackCLS;
    /**
     * Capture the information of the user agent.
     */
    private _trackNavigator;
    /** Starts tracking the Largest Contentful Paint on the current page. */
    private _trackLCP;
    /** Starts tracking the First Input Delay on the current page. */
    private _trackFID;
}
export interface ResourceEntry extends Record<string, unknown> {
    initiatorType?: string;
    transferSize?: number;
    encodedBodySize?: number;
    decodedBodySize?: number;
}
/** Create resource-related spans */
export declare function addResourceSpans(transaction: Transaction, entry: ResourceEntry, resourceName: string, startTime: number, duration: number, timeOrigin: number): number | undefined;
/**
 * Helper function to start child on transactions. This function will make sure that the transaction will
 * use the start timestamp of the created child span if it is earlier than the transactions actual
 * start timestamp.
 */
export declare function _startChild(transaction: Transaction, { startTimestamp, ...ctx }: SpanContext): Span;
//# sourceMappingURL=metrics.d.ts.map