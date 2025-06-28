import { EventEmitter } from 'node:events';

/**
 * A strongly typed map of framework-level events and their corresponding payloads.
 */
export interface EventMap {
    /** Emitted when the application starts booting. */
    'app.booting': {};

    /** Emitted when the application has finished booting. */
    'app.booted': {};

    /** Emitted when the application is shutting down. */
    'app.terminating': {};

    /** Emitted when a container service is being resolved. */
    'container.resolving': {
        /** The abstract class name or constructor. */
        abstract: string | Function;
        /** The instance being resolved. */
        instance: any;
    };

    /** Emitted after a container service has been resolved. */
    'container.resolved': {
        abstract: string | Function;
        instance: any;
    };

    /** Emitted when a service provider is about to be registered. */
    'provider.registering': {
        /** The name or identifier of the provider. */
        provider: string;
    };

    /** Emitted when a service provider is about to be booted. */
    'provider.booting': {
        provider: string;
    };

    /** Emitted when a route has been matched by the router. */
    'route.matched': {
        /** The matched route path. */
        route: string;
        /** The parameters extracted from the route. */
        parameters: Record<string, any>;
    };

    /** Emitted when a new HTTP request is received. */
    'request.received': {
        /** The HTTP method used (e.g., GET, POST). */
        method: string;
        /** The full URL requested. */
        url: string;
    };

    /** Emitted after the request has been handled. */
    'request.handled': {
        /** The time taken to handle the request, in milliseconds. */
        responseTime: number;
    };

    /** Emitted when an unhandled exception occurs. */
    'exception.thrown': {
        /** The error instance that was thrown. */
        error: Error;
    };
}

/**
 * Strongly typed event emitter for the framework.
 * Provides typed `on`, `emit`, and `dispatch` methods for internal events.
 */
export class Emitter extends EventEmitter {
    /**
     * Emit a typed event with its payload.
     *
     * @param event - The name of the event to emit.
     * @param payload - The payload associated with the event.
     * @returns `true` if the event had listeners, otherwise `false`.
     */
    override emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): boolean {
        return super.emit(event, payload);
    }

    /**
     * Register a listener for a specific typed event.
     *
     * @param event - The event name to listen for.
     * @param listener - A callback function that receives the event's payload.
     * @returns The emitter instance for chaining.
     */
    override on<K extends keyof EventMap>(event: K, listener: (payload: EventMap[K]) => void): this {
        return super.on(event, listener);
    }

    /**
     * Dispatch a typed event. This is a semantic alias for `emit`.
     *
     * @param event - The name of the event to dispatch.
     * @param payload - The payload to send with the event.
     */
    dispatch<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
        this.emit(event, payload);
    }
}
