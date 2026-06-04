/**
 * Jest global setup file
 * Запускается перед всеми тестами
 */
import { config } from './env';

export default function setup(): void {
  console.log(`🚀 Test suite starting against ${config.baseUrl}`);
  console.log(`⚙️  Timeout: ${config.timeoutMs}ms | Retries: ${config.retryAttempts}`);
}
