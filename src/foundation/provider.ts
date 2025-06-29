import type { Container } from './container.js';

/**
 * Base class for all service providers in the framework.
 *
 * Each service provider can register and boot services into the container.
 */
export abstract class ServiceProvider {
    /**
     * The application container instance.
     */

    constructor(protected app: Container) {}

    /**
     * Register services/bindings into the container.
     * This is called during the "register" phase of the app.
     */
    abstract register(): void;

    /**
     * Boot services after all providers have been registered.
     * This is called after registration is complete.
     */
    abstract boot(): void;
}
