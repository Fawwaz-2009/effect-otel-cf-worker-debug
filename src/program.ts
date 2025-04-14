import { Effect } from 'effect';

// Shared program logic
export const program = Effect.log('Hello').pipe(
	Effect.withSpan('c'),
	Effect.withSpan('b'),
	Effect.withSpan('a'),
	Effect.repeatN(3),
	Effect.annotateSpans('working', true)
);

// Shared failing program logic
export const failingProgram = Effect.fail(new Error('Failing program')).pipe(Effect.withSpan('d'));
