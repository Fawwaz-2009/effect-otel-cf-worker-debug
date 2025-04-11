# Effect.ts OpenTelemetry Cloudflare Worker Debugging

This repository contains test cases to debug why Effect.ts with OpenTelemetry integration works in a regular Node.js environment but fails to send telemetry data when running in a Cloudflare Worker environment.

## Project Structure

- `src/regular-node.ts`: A working example of Effect.ts with OpenTelemetry in a Node.js environment
- `src/index.ts`: The Cloudflare Worker implementation with the same telemetry setup
- `.dev.vars.example`: Example environment variables needed for both implementations

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.dev.vars` file based on the example:
```bash
cp .dev.vars.example .dev.vars
```

3. Update the `.dev.vars` file with your actual OpenTelemetry configuration:
```
OTEL_EXPORTER_OTLP_ENDPOINT=your-endpoint
OTEL_EXPORTER_API_KEY=your-api-key
APP_NAME_OTL=your-app-name
```

> **Note**: The OpenTelemetry configuration values (`OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_EXPORTER_API_KEY`) will depend on your specific OTEL Collector setup and the destination where you want to send the telemetry data (e.g., Grafana, Jaeger, etc.). Make sure to use the correct endpoint and authentication details for your telemetry pipeline.

## Testing

### Node.js Environment (Working Example)

To run the working Node.js example:
```bash
pnpm exec tsx src/regular-node.ts
```

This implementation successfully sends telemetry data to your Grafana dashboard.

### Cloudflare Worker Environment (Debugging)

To run the Cloudflare Worker locally:
```bash
pnpm run dev
```

The worker will be available at http://localhost:8787

## Debugging Context

The repository contains two implementations of the same telemetry setup:
1. A Node.js version that works correctly
2. A Cloudflare Worker version that currently fails to send telemetry data

The goal is to identify why the telemetry data doesn't reach Grafana when running in the Cloudflare Worker environment, while it works perfectly in the Node.js environment.

