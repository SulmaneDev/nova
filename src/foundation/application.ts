import { Container } from './container.js';
import { type ServiceProvider } from './provider.js';
import { Emitter } from './emitter.js';
import { Logger } from './logger.js';

/**
 * @fileoverview Application bootstrap and lifecycle management class.
 *
 * This file defines the core `Application` class, responsible for:
 *   - Bootstrapping the framework environment
 *   - Managing service providers and container bindings
 *   - Providing centralized access to configuration, paths, and environment state
 *   - Acting as the main entry point for dependency injection and service resolution
 *
 * Inspired by Laravel's `Application` container, this class extends the IoC container
 * to add higher-level framework capabilities for TypeScript-based systems.
 *
 * @author Muhammad Sulman <whomaderules@gmail.com>
 * @license MIT
 * @copyright Copyright (c) 2025 Muhammad Sulman
 * @created 2025-06-27
 * @version 1.0.0
 */

export class Application extends Container {
    /**
     * The Nova Components version.
     */
    public VERSION = '1.0.0';

    /**
     * The base path for the Laravel installation.
     * @type {string}
     */
    protected basePath?: string;

    /**
     * Indicates if the application has "booted".
     * @type {boolean}
     */
    protected hasBeenBootstrapped: boolean = false;

    /**
     * Indicates if the application has "booted".
     * @type {boolean}
     */
    protected booted: boolean = false;

    /**
     * All of the registered service providers.
     * @type {Map<string,ServiceProvider>}
     */
    protected serviceProviders: Map<string, ServiceProvider> = new Map();

    /**
     * The names of the loaded service providers.
     */
    protected loadedProviders: Map<string, boolean> = new Map();

    /**
     * The custom bootstrap path defined by the developer.
     * @type {string}
     */
    protected bootstrapPath: string = './bootstrap/';

    /**
     * The custom application path defined by the developer.
     * @type {string}
     */
    protected appPath: string = './app/';

    /**
     * The custom configuration path defined by the developer.
     * @type {string}
     */
    protected configPath: string = './config/';

    /**
     * The custom database path defined by the developer.
     * @type {string}
     */
    protected databasePath: string = './database/';

    /**
     * The custom language file path defined by the developer.
     * @type {string}
     */
    protected langPath: string = `./public/lang/`;

    /**
     * The custom public / web path defined by the developer.
     * @type {string}
     */
    protected publicPath: string = './public/';

    /**
     * The custom storage path defined by the developer.
     * @type {string}
     */
    protected storagePath: string = './storage/';

    /**
     * The custom environment path defined by the developer.
     * @type {string}
     */
    protected environmentPath: string = '.';

    /**
     * The custom cache path defined by the developer.
     * @type {string}
     */
    protected cachePath: string = './storage/cache/framework/';

    /**
     * The environment file to load during bootstrapping.
     * @type {string}
     */
    protected environmentFile: string = '.env';

    /**
     * Indicates if the application is running in the console.
     * @type {boolean | null}
     */
    protected isRunningInConsole: boolean | null = null;

    /**
     * Indicates if the framework's base configuration should be merged.
     * @type {boolean}
     */
    protected mergeFrameworkConfiguration: boolean = false;

    /**
     * Create a new Illuminate application instance.
     * @param {string | null} basePath
     */
    constructor(basePath: string | null = null) {
        super();
        if (basePath) {
            this.basePath = basePath;
        }
        this.registerBaseBindings();
    }

    /**
     * Get the version number of the application.
     * @type {string}
     */
    public get V(): string {
        return this.VERSION;
    }

    /**
     *  Register all of the base service providers.
     * @returns {void}
     */
    protected registerBaseBindings(): void {
        this.instance('app', this);
        this.instance(Container, this);
        this.instance(Logger, new Logger(this.storagePath));
        this.instance(Emitter, new Emitter());
    }

    /**
     * Mark the given provider as registered.
     * @param {string} provider
     * @param {ServiceProvider} instance
     * @returns {void}
     */
    protected markedAsRegistered(provider: string, instance: ServiceProvider): void {
        this.serviceProviders.set(provider, instance);
        this.loadedProviders.set(provider, true);
    }

    /**
     *
     * @param {string} provider
     * @param {boolean} force
     * @returns {ServiceProvider}
     */
    public register(provider: string, force: boolean = false): ServiceProvider {
        const existing = this.getProvider(provider);
        if (existing && !force) {
            return existing;
        }
        const instance = this.serviceProviders.get(provider);
        if (!instance) {
            throw new Error(`Service provider [${provider}] is not registered.`);
        }
        instance.register();
        this.markedAsRegistered(provider, instance);
        return instance;
    }

    /**
     *
     * @param {ServiceProvider} provider
     * @returns {void}
     */
    protected bootProvider(provider: ServiceProvider): void {
        provider.boot();
    }

    /**
     * Determine if the application has booted.
     * @returns {boolean}
     */
    public isBooted(): boolean {
        return this.booted;
    }

    /**
     * Get the registered service provider instance if it exists.
     * @param {string} provider
     * @returns {ServiceProvider | null}
     */
    public getProvider(provider: string): ServiceProvider | null {
        return this.serviceProviders.get(provider) ?? null;
    }

    /**
     * Flush the container of all bindings and resolved instances.
     * @returns {void}
     */
    public flush():void {
        this.buildStack = [];
    }
}
