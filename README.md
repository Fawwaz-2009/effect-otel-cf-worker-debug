# Effect & OpenTelemetry Debugging with Cloudflare Worker

This repository provides a minimal reproduction case to debug an issue with sending OpenTelemetry (OTEL) traces from an Effect application running inside a Cloudflare Worker.

## The Issue

We have two implementations:
- A regular Node.js app (`src/regular-node.ts`) that sends traces correctly.
- A Cloudflare Worker app (`src/index.ts`) that sends traces but does **not appear** in Grafana, despite reaching the OTLP collector.

Both applications use the same setup (`@effect/opentelemetry`). The issue seems specific to traces originating from within Cloudflare Workers.

## Project Structure

- `src/regular-node.ts`: Working Node.js example.
- `src/index.ts`: Cloudflare Worker example with the issue.

## Quick Setup

1. **Start Grafana LGTM Stack** (Grafana + OTLP Collector)

```bash
docker run -p 3000:3000 -p 4317:4317 -p 4318:4318 --rm -it -e ENABLE_LOGS_OTELCOL=true --name otel-lgtm docker.io/grafana/otel-lgtm
```

Grafana available at: `http://localhost:3000`

2. **Install dependencies**

```bash
pnpm install
```

3. **Run the working Node.js example**

```bash
pnpm exec tsx src/regular-node.ts
```

- Check Grafana dashboard; traces will appear correctly.

4. **Run the problematic Cloudflare Worker**

```bash
pnpm run dev
```

- Cloudflare Worker available at: `http://localhost:8787`
- Trigger the worker via browser or `curl`.

## Observations & Debugging Tips

- Confirm outgoing OTLP traces:

```bash
sudo tcpdump -i lo0 -A -s 0 port 4318
```

- **Expected**: Both Node.js and Cloudflare Worker traces should appear in Grafana Tempo (accessible at `http://localhost:3000`). Navigate to the Tempo search screen to verify.
- **Actual**: Both implementations reach the OTLP collector, but **only** Node.js traces appear in Grafana Tempo.

### Objective

Identify why the Cloudflare Worker OTLP traces, though sent successfully, fail to appear in Grafana.