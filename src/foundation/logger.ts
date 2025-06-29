import fs from 'fs';
import path from 'path';
import type { Writable } from 'stream';

type LogLevel = 'info' | 'warning' | 'error' | 'debug' | 'notice';

/**
 * Structure of a log entry payload.
 */
export interface LogPayload {
    level: LogLevel;
    message: string;
    context?: Record<string, any>;
    timestamp: string;
}

/**
 * Interface for pipe classes that can transform or filter logs.
 */
export interface LogPipe {
    handle(payload: LogPayload, next: (payload: LogPayload) => Promise<void>): Promise<void>;
}

type Pipe = LogPipe | ((payload: LogPayload, next: (payload: LogPayload) => Promise<void>) => Promise<void>);

/**
 * Framework-level logger with support for writing to file and transforming logs via pipes.
 * Inspired by Laravel's logger abstraction.
 */
export class Logger {
    protected pipes: Pipe[] = [];
    protected logDir: string;
    protected stream: Writable;

    /**
     * Create a new Logger instance.
     * @param logDir - The directory where logs will be written.
     */
    constructor(logDir = './storage/logs') {
        this.logDir = logDir;
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logFile = path.join(logDir, this.getDateFilename());
        this.stream = fs.createWriteStream(logFile, { flags: 'a' });
    }

    /**
     * Generate the filename for today's log file.
     * @returns Log file name in the format `app-YYYY-MM-DD.log`.
     */
    protected getDateFilename(): string {
        const date = new Date();
        const stamp = date.toISOString().split('T')[0];
        return `app-${stamp}.log`;
    }

    /**
     * Register an array of pipes to transform or intercept log entries.
     * @param pipes - An array of Pipe classes or functions.
     * @returns The logger instance (for chaining).
     */
    pipeThrough(pipes: Pipe[]): this {
        this.pipes = pipes;
        return this;
    }

    /**
     * Write a log entry with a specified level, message, and context.
     * @param level - The log level.
     * @param message - The main log message.
     * @param context - Additional context or metadata.
     */
    async log(level: LogLevel, message: string, context: Record<string, any> = {}): Promise<void> {
        const payload: LogPayload = {
            level,
            message,
            context,
            timestamp: new Date().toISOString(),
        };

        await this.dispatch(0, payload);
    }

    /**
     * Internal method to process log entry through the pipeline.
     * @param index - Current index in the pipe chain.
     * @param payload - The log payload to process.
     */
    protected async dispatch(index: number, payload: LogPayload): Promise<void> {
        if (index === this.pipes.length) {
            return this.writeToFile(payload);
        }

        const pipe = this.pipes[index];
        const next = (p: LogPayload): Promise<void> => this.dispatch(index + 1, p);

        if (typeof pipe === 'function') {
            return pipe(payload, next);
        }

        return pipe.handle(payload, next);
    }

    /**
     * Write the log entry to the configured log file.
     * @param payload - The final log payload.
     */
    protected writeToFile(payload: LogPayload): void {
        const line = `[${payload.timestamp}] ${payload.level.toUpperCase()}: ${payload.message}`;
        const context = payload.context && Object.keys(payload.context).length ? ` | ${JSON.stringify(payload.context)}` : '';
        this.stream.write(`${line}${context}\n`);
    }

    /**
     * Write an info-level log message.
     * @param message - The message content.
     * @param context - Optional context.
     */
    info(message: string, context?: Record<string, any>): Promise<void> {
        return this.log('info', message, context);
    }

    /**
     * Write an error-level log message.
     * @param message - The message content.
     * @param context - Optional context.
     */
    error(message: string, context?: Record<string, any>): Promise<void> {
        return this.log('error', message, context);
    }

    /**
     * Write a warning-level log message.
     * @param message - The message content.
     * @param context - Optional context.
     */
    warning(message: string, context?: Record<string, any>): Promise<void> {
        return this.log('warning', message, context);
    }

    /**
     * Write a debug-level log message.
     * @param message - The message content.
     * @param context - Optional context.
     */
    debug(message: string, context?: Record<string, any>): Promise<void> {
        return this.log('debug', message, context);
    }

    /**
     * Write a notice-level log message.
     * @param message - The message content.
     * @param context - Optional context.
     */
    notice(message: string, context?: Record<string, any>): Promise<void> {
        return this.log('notice', message, context);
    }
}
