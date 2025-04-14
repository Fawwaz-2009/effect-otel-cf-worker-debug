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
import * as OtlpTracer from '@effect/opentelemetry/OtlpTracer';
import { NodeHttpClient, NodeRuntime } from '@effect/platform-node';
import { Effect, Layer } from 'effect';

const Tracing = OtlpTracer.layer({
	url: 'http://localhost:4318/v1/traces',
	resource: {
		serviceName: 'my-service',
	},
}).pipe(Layer.provide(NodeHttpClient.layerUndici));

const program = Effect.log('Hello').pipe(
	Effect.withSpan('c'),
	Effect.withSpan('b'),
	Effect.withSpan('a'),
	Effect.repeatN(3),
	Effect.annotateSpans('working', true)
);

const failingProgram = Effect.fail(new Error('Failing program')).pipe(Effect.withSpan('d'));

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const res = await program.pipe(
			Effect.andThen(failingProgram),
			Effect.provide(Tracing),
			Effect.catchAllCause(Effect.logError),
			NodeRuntime.runMain
		);

		return new Response(null, { status: 200 });
	},
} satisfies ExportedHandler<Env>;
