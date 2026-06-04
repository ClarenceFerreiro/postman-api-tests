/**
 * Test configuration and environment setup
 * All env vars with defaults and validation
 */
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  baseUrl: process.env.BASE_URL || 'https://jsonplaceholder.typicode.com',
  timeoutMs: parseInt(process.env.REQUEST_TIMEOUT_MS || '5000', 10),
  retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3', 10),
  maxContentLength: parseInt(process.env.MAX_CONTENT_LENGTH || '1048576', 10), // 1MB
  performanceThreshold: {
    critical: parseInt(process.env.PERF_CRITICAL_MS || '200', 10),     // <200ms: excellent
    warning: parseInt(process.env.PERF_WARNING_MS || '500', 10),        // 200-500ms: acceptable
    failure: parseInt(process.env.PERF_FAILURE_MS || '1000', 10),       // >1000ms: failed
  },
  isMock: process.env.TEST_ENV === 'mock',
  testData: {
    validUserId: 1,
    invalidUserId: 999999,
    validPostId: 1,
    invalidPostId: 999999,
    validCommentId: 1,
  },
} as const;

/**
 * Performance tier classification based on response time
 */
export type PerformanceTier = 'excellent' | 'acceptable' | 'slow' | 'failed';

export function classifyPerformance(durationMs: number): PerformanceTier {
  if (durationMs < config.performanceThreshold.critical) return 'excellent';
  if (durationMs < config.performanceThreshold.warning) return 'acceptable';
  if (durationMs < config.performanceThreshold.failure) return 'slow';
  return 'failed';
}

/**
 * Jest setup: runs before all tests
 */
export default function globalSetup(): void {
  console.log(`🚀 Test suite starting against ${config.baseUrl}`);
  console.log(`⏱️  Performance thresholds: critical=${config.performanceThreshold.critical}ms, warning=${config.performanceThreshold.warning}ms`);
}
