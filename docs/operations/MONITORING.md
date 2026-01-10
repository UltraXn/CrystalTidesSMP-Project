# 📊 Monitoring & Logging

> **Application monitoring, logging, and observability**

This guide covers how to monitor the health and performance of CrystalTides in production.

---

## 🎯 Monitoring Strategy

### Key Metrics to Track

1. **Application Health**
   - Uptime/downtime
   - Response times
   - Error rates

2. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk usage
   - Network I/O

3. **Database**
   - Query performance
   - Connection pool usage
   - Slow queries

4. **User Metrics**
   - Active users
   - Request volume
   - Geographic distribution

---

## 🔍 Logging

### Log Levels

```typescript
// Recommended log levels
enum LogLevel {
  ERROR = 'error',    // Critical errors requiring immediate attention
  WARN = 'warn',      // Warning conditions
  INFO = 'info',      // Informational messages
  DEBUG = 'debug'     // Debug-level messages (development only)
}
```

### Structured Logging

**Web Server Example**:
```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

// Usage
logger.info('User logged in', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent']
})

logger.error('Database connection failed', {
  error: err.message,
  stack: err.stack,
  database: 'mysql'
})
```

### Log Rotation

```javascript
// winston-daily-rotate-file
import DailyRotateFile from 'winston-daily-rotate-file'

const transport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'  // Keep logs for 14 days
})

logger.add(transport)
```

---

## 📈 Application Performance Monitoring (APM)

### Recommended Tools

1. **Sentry** - Error tracking and performance monitoring
2. **New Relic** - Full-stack observability
3. **Datadog** - Infrastructure and application monitoring
4. **Google Cloud Monitoring** - Native GCP integration

### Sentry Integration

**Installation**:
```bash
npm install @sentry/node @sentry/tracing
```

**Configuration**:
```typescript
// apps/web-server/sentry.ts
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,  // 100% of transactions for performance monitoring
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app }),
    new Tracing.Integrations.Mysql()
  ]
})

// Error handling middleware
app.use(Sentry.Handlers.errorHandler())
```

**Usage**:
```typescript
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'gacha',
      userId: user.id
    },
    extra: {
      requestBody: req.body
    }
  })
  throw error
}
```

---

## 🏥 Health Checks

### Endpoint Implementation

```typescript
// apps/web-server/routes/health.ts
app.get('/api/health', async (req, res) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      supabase: await checkSupabase(),
      redis: await checkRedis()
    }
  }
  
  const allHealthy = Object.values(checks.checks).every(c => c.status === 'ok')
  
  res.status(allHealthy ? 200 : 503).json(checks)
})

async function checkDatabase() {
  try {
    await mysqlPool.query('SELECT 1')
    return { status: 'ok', latency: 5 }
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}
```

### Kubernetes Liveness/Readiness Probes

```yaml
# deployment.yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 📊 Metrics Collection

### Prometheus Integration

**Installation**:
```bash
npm install prom-client
```

**Setup**:
```typescript
import promClient from 'prom-client'

// Create a Registry
const register = new promClient.Registry()

// Add default metrics
promClient.collectDefaultMetrics({ register })

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
})

// Middleware
app.use((req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration)
  })
  
  next()
})

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})
```

### Custom Business Metrics

```typescript
// Track gacha rolls
const gachaRolls = new promClient.Counter({
  name: 'gacha_rolls_total',
  help: 'Total number of gacha rolls',
  labelNames: ['rarity'],
  registers: [register]
})

// Usage
gachaRolls.labels('legendary').inc()

// Track active users
const activeUsers = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of currently active users',
  registers: [register]
})

// Update periodically
setInterval(async () => {
  const count = await getActiveUserCount()
  activeUsers.set(count)
}, 60000)  // Every minute
```

---

## 🔔 Alerting

### Alert Rules (Prometheus)

```yaml
# alerts.yml
groups:
  - name: crystaltides
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors/sec"
      
      - alert: DatabaseDown
        expr: up{job="mysql"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
      
      - alert: HighMemoryUsage
        expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) < 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90%"
```

### Discord Webhooks for Alerts

```typescript
async function sendAlertToDiscord(alert: Alert) {
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `🚨 ${alert.severity.toUpperCase()}: ${alert.title}`,
        description: alert.description,
        color: alert.severity === 'critical' ? 0xFF0000 : 0xFFA500,
        fields: [
          { name: 'Service', value: alert.service, inline: true },
          { name: 'Time', value: new Date().toISOString(), inline: true }
        ]
      }]
    })
  })
}
```

---

## 📉 Dashboard Examples

### Grafana Dashboard

**Panels to include**:

1. **System Overview**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

2. **Application Metrics**
   - Request rate (req/s)
   - Response time (p50, p95, p99)
   - Error rate
   - Active connections

3. **Database Metrics**
   - Query rate
   - Slow queries
   - Connection pool usage
   - Replication lag

4. **Business Metrics**
   - Active users
   - Gacha rolls
   - New registrations
   - Revenue (if applicable)

### Sample Grafana Query

```promql
# Average response time by endpoint
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Error rate percentage
(rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])) * 100

# Active WebSocket connections
websocket_connections_active
```

---

## 🔍 Log Aggregation

### ELK Stack (Elasticsearch, Logstash, Kibana)

**Logstash Configuration**:
```ruby
input {
  file {
    path => "/var/log/crystaltides/*.log"
    type => "json"
    codec => "json"
  }
}

filter {
  if [type] == "json" {
    json {
      source => "message"
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "crystaltides-%{+YYYY.MM.dd}"
  }
}
```

### Google Cloud Logging

```typescript
import { Logging } from '@google-cloud/logging'

const logging = new Logging()
const log = logging.log('crystaltides')

async function writeLog(severity: string, message: string, metadata?: any) {
  const entry = log.entry({
    severity,
    resource: { type: 'cloud_run_revision' }
  }, {
    message,
    ...metadata
  })
  
  await log.write(entry)
}
```

---

## 📚 Related Documentation

- [[Troubleshooting](./TROUBLESHOOTING.md)] - Common issues and solutions
- [[Security](./SECURITY.md)] - Security best practices
- [[Deployment](../getting-started/DEPLOYMENT.md)] - Deployment guide

---

## 🔗 External Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [Sentry Documentation](https://docs.sentry.io/)

---

_Last updated: January 10, 2026_
