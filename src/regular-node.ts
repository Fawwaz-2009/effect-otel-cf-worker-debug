import { Effect, Layer } from 'effect';
import * as OtlpTracer from '@effect/opentelemetry/OtlpTracer';
import { FetchHttpClient } from '@effect/platform';
import { program, failingProgram } from './program'; 

const TracingLive = OtlpTracer.layer({
	url: 'http://localhost:4318/v1/traces',
	resource: {
		serviceName: 'my-node-service', 
	},
}).pipe(Layer.provide(FetchHttpClient.layer));

const runnable = program.pipe(
	Effect.andThen(failingProgram),
	Effect.provide(TracingLive),
	Effect.catchAllCause(Effect.logError)
);

Effect.runPromise(runnable);

