/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { NodeSdk } from '@effect/opentelemetry';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Effect } from 'effect';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const task = (name: string, delay: number, children: ReadonlyArray<Effect.Effect<void>> = []) =>
			Effect.gen(function* () {
				yield* Effect.log(name);
				yield* Effect.sleep(`${delay} millis`);
				for (const child of children) {
					yield* child;
				}
				yield* Effect.sleep(`${delay} millis`);
			}).pipe(Effect.withSpan(name));

		const poll = task('/poll', 1);

		// Create a program with tasks and subtasks
		const program = task('client', 2, [
			task('/api', 3, [
				task('/authN', 4, [task('/authZ', 5)]),
				task('/payment Gateway', 6, [task('DB', 7), task('Ext. Merchant', 8)]),
				task('/dispatch', 9, [
					task('/dispatch/search', 10),
					Effect.all([poll, poll, poll], { concurrency: 'inherit' }),
					task('/pollDriver/{id}', 11),
				]),
			]),
		]).pipe(Effect.map(() => 'FINISHED'));
		const NodeSdkLive = NodeSdk.layer(() => ({
			resource: { serviceName: env.APP_NAME_OTL! },
			spanProcessor: new BatchSpanProcessor(
				new OTLPTraceExporter({
					url: `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
					headers: { 'x-api-key': env.OTEL_EXPORTER_API_KEY },
				})
			),
		}));

		const result = await Effect.runPromise(program.pipe(Effect.provide(NodeSdkLive), Effect.catchAllCause(Effect.logError)));
		return new Response(`Effect result: ${result}`);
	},
} satisfies ExportedHandler<Env>;
