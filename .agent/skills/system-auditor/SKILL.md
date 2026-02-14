---
name: system-auditor
description: "Expert system auditing for security, performance, and infrastructure health. Focuses on vulnerability scanning, resource bottleneck identification, log anomaly detection, and best practice compliance."
---

# System Auditor Skill

**Activate this skill whenever** the user requests:
- Security audit or vulnerability scan
- Performance bottleneck analysis
- Infrastructure health check
- Configuration review
- Log analysis for anomalies
- Compliance verification (best practices)

## Core Principles

**Always prioritize:**
1. **Security First** - Identify exposed secrets, loose permissions, and outdated dependencies.
2. **Evidence-Based** - Base findings on logs, metrics, and command output, not assumptions.
3. **Actionable Remediation** - Provide clear steps to fix every identified issue.
4. **Holistic View** - Consider the interaction between code, infrastructure, and configuration.

## 1. Security Auditing Protocol

### Check for Exposed Secrets
- Scan for strings like `API_KEY`, `SECRET`, `PASSWORD`, `TOKEN`.
- Verify `.env` files are in `.gitignore`.
- Scan commit history for accidental leakages if necessary.

### Dependency Vulnerabilities
- Run `npm audit`, `cargo audit`, or equivalent tools.
- Check for outdated packages with known CVEs.
- Review dependency tree for untrusted or "orphaned" packages.

### Access Control & Permissions
- Verify file permissions (especially for SSH keys and config files).
- Check for "unnecessarily privileged" processes (running as root/admin when not needed).

## 2. Performance Auditing Protocol

### Resource Monitoring
- Check CPU and Memory usage patterns.
- Identify "memory leaks" (increasing memory usage over time).
- Verify disk I/O and network latency.

### Bottleneck Identification
- Profile slow API calls or database queries.
- Check for inefficient loops or high-complexity algorithms.
- Analyze build/startup times.

## 3. Log & Infrastructure Health

### Log Analysis
- Search for `ERROR`, `CRITICAL`, or `EXCEPTION` in logs.
- Detect "anomaly patterns" (unusual spike in specific logs).
- Verify log categorization and readability.

### Infrastructure Checks
- Check health endpoints of external services (Supabase, GitHub API).
- Verify connectivity and timeout configurations.
- Audit environment variable consistency across environments.

## Output Format
Every audit report must include:
1. **Summary**: High-level status (Healthy / At Risk / Critical).
2. **Findings**: Categorized list of issues with severity levels.
3. **Evidence**: Snippets of logs, command outputs, or code.
4. **Remediation Plan**: Precise steps to resolve the findings.

**Example Severity Levels:**
- 🔴 **CRITICAL**: Immediate action required (e.g., exposed secrets).
- 🟠 **WARNING**: Action required soon (e.g., outdated dependencies).
- 🔵 **NOTICE**: Optimization suggested (e.g., slow query).
