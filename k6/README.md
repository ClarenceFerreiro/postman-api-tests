# k6 Load Testing

Performance testing with [k6](https://k6.io/) — load, stress, and spike scenarios.

## Quick Start

### Install k6
```bash
# macOS
brew install k6

# Linux
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Docker
docker pull grafana/k6
```

### Run load test
```bash
cd k6
k6 run load-test.js

# Against local Docker API
BASE_URL=http://localhost:3000 k6 run load-test.js
```

## Scenarios

| Stage | Duration | Users | Purpose |
|-------|----------|-------|---------|
| Ramp-up | 30s | 0 → 10 | Warm up |
| Steady | 1m | 10 | Baseline |
| Spike | 30s | 10 → 20 | Stress test |
| Ramp-down | 30s | 20 → 0 | Cool down |

## Thresholds

- **p95 latency** < 500ms
- **Error rate** < 5%

## CI Integration (GitHub Actions)

```yaml
- name: Run k6 load tests
  uses: grafana/k6-action@v0.3.1
  with:
    filename: k6/load-test.js
    flags: --env BASE_URL=https://jsonplaceholder.typicode.com
```
