import { Pipeline, PipeClass, PipeHandler } from '../../src/foundation/pipeline';

describe('Pipeline', () => {
    it('passes data through function-based pipes in order', async () => {
        const pipe1: PipeHandler<number> = async (payload, next) => {
            return next(payload + 1);
        };

        const pipe2: PipeHandler<number> = async (payload, next) => {
            return next(payload * 2);
        };

        const result = await new Pipeline<number>().send(5).through([pipe1, pipe2]).thenReturn();

        expect(result).toBe(12);
    });

    it('passes data through class-based pipes in order', async () => {
        class AddThree implements PipeClass<number> {
            async handle(payload: number, next: (payload: number) => Promise<any>) {
                return next(payload + 3);
            }
        }

        class MultiplyByTwo implements PipeClass<number> {
            async handle(payload: number, next: (payload: number) => Promise<any>) {
                return next(payload * 2);
            }
        }

        const result = await new Pipeline<number>().send(4).through([AddThree, MultiplyByTwo]).thenReturn();

        expect(result).toBe(14);
    });

    it('returns final value if no pipes are given', async () => {
        const result = await new Pipeline<string>().send('hello').through([]).thenReturn();
        expect(result).toBe('hello');
    });

    it('throws error if next is called multiple times', async () => {
        const badPipe: PipeHandler<string> = async (payload, next) => {
            await next(payload + 'a');
            return next(payload + 'b');
        };

        await expect(new Pipeline<string>().send('x').through([badPipe]).thenReturn()).rejects.toThrow('Pipeline: next() called multiple times');
    });

    it('can mix class-based and function-based pipes', async () => {
        const double: PipeHandler<number> = async (val, next) => next(val * 2);

        class Square implements PipeClass<number> {
            async handle(val: number, next: (v: number) => Promise<any>) {
                return next(val * val);
            }
        }

        const subtractOne: PipeHandler<number> = async (val, next) => next(val - 1);

        const result = await new Pipeline<number>().send(2).through([double, Square, subtractOne]).thenReturn();

        expect(result).toBe(15);
    });
});
