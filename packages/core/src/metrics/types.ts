import type { MetricBucketItem } from '@sentry/types';
import type { COUNTER_METRIC_TYPE, DISTRIBUTION_METRIC_TYPE, GAUGE_METRIC_TYPE, SET_METRIC_TYPE } from './constants';

export type MetricType =
  | typeof COUNTER_METRIC_TYPE
  | typeof GAUGE_METRIC_TYPE
  | typeof SET_METRIC_TYPE
  | typeof DISTRIBUTION_METRIC_TYPE;

export type SimpleMetricBucket = Map<string, MetricBucketItem>;
