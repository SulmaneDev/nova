/**
 * @fileoverview Framework-level pipeline implementation for processing data through
 * a sequence of class-based or function-based middleware.
 *
 * Inspired by Laravel's pipeline and middleware pattern, this class provides:
 * - Chainable fluent API (`send`, `through`, `thenReturn`)
 * - Support for function or class-based pipes
 * - Stack-safe async execution with full control over flow
 * - Suitable for queues, jobs, middleware, data transformations, etc.
 *
 * Efficient and extendable, designed with DX and memory in mind.
 *
 * @author Muhammad Sulman
 * @license MIT
 * @created 2025-06-28
 * @version 1.0.0
 */

/**
 * A function-based pipe that transforms data.
 *
 * @template T The type of payload passing through the pipeline.
 */
export type PipeHandler<T> = (payload: T, next: (payload: T) => Promise<any>) => Promise<any>;

/**
 * Interface for class-based pipe handlers.
 *
 * @template T The type of payload passing through the pipeline.
 */
export interface PipeClass<T> {
    handle(payload: T, next: (payload: T) => Promise<any>): Promise<any>;
}

/**
 * A pipe is either a function or a class implementing PipeClass interface.
 */
export type Pipe<T> = PipeHandler<T> | (new () => PipeClass<T>);

/**
 * A highly flexible and efficient async pipeline runner.
 *
 * Supports both functional and class-based middleware, resolves each in order,
 * and returns the final transformed payload. Suitable for jobs, data flows,
 * middleware pipelines, and queue processors.
 *
 * @template T The type of data flowing through the pipeline.
 */
export class Pipeline<T = any> {
    /**
     * The sequence of pipes to run through.
     */
    protected pipes: Pipe<T>[] = [];

    /**
     * The data being passed through the pipeline.
     */
    protected payload!: T;

    /**
     * Set the initial payload to send through the pipeline.
     *
     * @param {T} payload - The input data.
     * @returns {this} - The pipeline instance (for chaining).
     */
    public send(payload: T): this {
        this.payload = payload;
        return this;
    }

    /**
     * Define the pipes (middleware) the data should pass through.
     *
     * @param {Pipe<T>[]} pipes - An array of functions or classes.
     * @returns {this} - The pipeline instance (for chaining).
     */
    public through(pipes: Pipe<T>[]): this {
        this.pipes = pipes;
        return this;
    }

    /**
     * Execute the pipeline and return the final payload.
     *
     * Each pipe is called in sequence. Pipes must call `next(payload)`
     * to pass control to the next pipe.
     *
     * @returns {Promise<T>} - The final processed payload.
     */
    public async thenReturn(): Promise<T> {
        let index = -1;

        /**
         * Internal dispatcher that recursively calls each pipe.
         *
         * @param {number} i - Current pipe index.
         * @param {T} value - Current payload.
         * @returns {Promise<T>} - Final transformed payload.
         */
        const dispatch = async (i: number, value: T): Promise<T> => {
            if (i <= index) {
                throw new Error('Pipeline: next() called multiple times');
            }

            index = i;

            if (i === this.pipes.length) {
                return value;
            }

            const pipe = this.pipes[i];
            const next = (val: T):Promise<T> => dispatch(i + 1, val);

            try {
                const instance = new (pipe as new () => PipeClass<T>)();
                return await instance.handle(value, next);
            } catch (_e) {
                return await (pipe as PipeHandler<T>)(value, next);
            }
        };

        return dispatch(0, this.payload);
    }
}
