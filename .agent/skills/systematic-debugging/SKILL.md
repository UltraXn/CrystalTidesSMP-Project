---
name: systematic-debugging
description: Comprehensive debugging methodology using reproduction protocols, browser-based inspection, screenshot analysis, and verification workflows to isolate and resolve software defects systematically.
---

# Systematic Debugging

## Overview

This skill provides a structured approach to debugging complex software issues through controlled reproduction, visual inspection, and verification protocols. Use this skill when you need to isolate root causes, validate fixes, or document bug behavior reproducibly.

## When to Use This Skill

- User reports a bug with unclear conditions or intermittent behavior
- Need to establish reproducible steps for a defect
- Analyzing visual issues, layout problems, or rendering anomalies
- Validating that a fix resolves the original issue without regressions
- Documenting bug behavior for issue tracking systems

## Core Debugging Workflow

### Phase 1: Reproduction Protocol
**Objective**: Establish deterministic, repeatable steps that trigger the issue consistently.
1. **Gather Context**: Request user environment: browser, OS, version, extensions.
2. **Establish Baseline**: Create a minimal test case isolating the issue.
3. **Validate Reproducibility**: Attempt reproduction following documented steps exactly.

### Phase 2: Browser-Based Inspection
**Objective**: Use browser developer tools to inspect runtime state and behavior.
1. **DOM and CSS Analysis**: Inspect computed styles vs. defined styles.
2. **Console and Network Analysis**: Monitor Console for errors and Network for failed requests.
3. **Performance and Memory**: Identify bottlenecks and excessive re-renders.

### Phase 3: Screenshot Analysis
**Objective**: Capture visual evidence and compare expected vs. actual behavior.
1. **Systematic Capture**: Take screenshots of the buggy state.
2. **Visual Inspection**: Compare pixel-level alignment and consistency.

### Phase 4: Root Cause Isolation
**Objective**: Narrow the source of the problem via hypothesis testing and code tracing.

### Phase 5: Verification Protocol
**Objective**: Confirm fix resolves the issue without introducing regressions.
1. **Fix Validation**: Confim issue no longer occurs.
2. **Regression Testing**: Run related feature tests.
