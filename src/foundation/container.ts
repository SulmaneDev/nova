import 'reflect-metadata';

/**
 * @fileoverview Custom Inversion of Control (IoC) Container implementation.
 *
 * Provides a Laravel-inspired, flexible dependency injection system for TypeScript/Node.js:
 * - Binding interfaces to concrete implementations
 * - Singleton and instance management
 * - Constructor-based dependency resolution
 * - Parameter overrides
 * - Class or closure-based concrete resolution
 *
 * Designed for framework-level service resolution with support for advanced DI features.
 *
 * @author Muhammad Sulman
 * @license MIT
 * @created 2025-06-27
 * @version 1.0.0
 */

/**
 * Represents an abstract service identifier.
 * Can be a class constructor, string, symbol, or a factory function.
 */
export type Abstract<T = any> = string | symbol | (new (...args: any[]) => T) | (() => T);

/**
 * A concrete implementation or factory that can be bound in the container.
 */
export type Concrete<T = any> = {
    value: (() => T) | (new (...args: any[]) => T);
    shared?: boolean;
};

export class Container {
    /**
     * The current globally available container instance (singleton pattern).
     */
    protected static instance?: Container;

    /**
     * A set of all resolved abstract identifiers.
     */
    protected resolved: Set<Abstract<any>> = new Set();

    /**
     * Map of abstract identifiers to their concrete bindings.
     */
    protected bindings: Map<Abstract, Concrete> = new Map();

    /**
     * Map of shared (singleton) instances.
     */
    protected instances: Map<Abstract, any> = new Map();

    /**
     * Stack of abstract identifiers being built (for debugging or circular refs).
     */
    protected buildStack: Abstract[] = [];

    /**
     * Bind an abstract identifier to a concrete implementation.
     *
     * @template T
     * @param {Abstract<T>} abstract - The abstract service name or type.
     * @param {Concrete<T>['value']} concrete - The factory or class to bind.
     * @param {boolean} [shared=false] - Whether the binding is a singleton.
     */
    public bind<T>(abstract: Abstract<T>, concrete: Concrete<T>['value'], shared?: boolean) {
        this.bindings.set(abstract, {
            value: concrete,
            shared: !!shared,
        });
    }

    /**
     * Extracts parameter names from a class constructor via string parsing.
     * Useful for mapping parameter overrides.
     *
     * @param {Function} constructor - The class constructor.
     * @returns {string[]} - List of constructor parameter names.
     */
    protected getParamNames(constructor: Function): string[] {
        const fnStr = constructor.toString();
        const argsMatch = fnStr.match(/constructor\s*[^\(]*\(\s*([^\)]*)\)/);

        if (!argsMatch) return [];

        return argsMatch[1].split(',').filter(Boolean);
    }

    /**
     * Builds a concrete instance by resolving its dependencies via reflection.
     * Supports parameter overrides and closures.
     *
     * @template T
     * @param {(() => T) | (new (...args: any[]) => T)} concrete - The factory or constructor.
     * @param {Record<string, any>} [parameters={}] - Optional parameter overrides by name.
     * @returns {T} - Instantiated object.
     */
    protected build<T>(concrete: (() => T) | (new (...args: any[]) => T), parameters: Record<string, any> = {}): T {
        if (typeof concrete === 'function' && !this.isClass(concrete)) {
            return (concrete as () => T)();
        }
        const constructor = concrete as new (...args: any[]) => T;
        const paramNames = this.getParamNames(constructor);
        const dependencies = paramNames.map((name, index) => {
            if (parameters[name] !== undefined) {
                return parameters[name];
            }
            if (this.has(name)) {
                return this.make(name);
            }

            throw new Error(`Cannot resolve dependency: "${name}" at index ${index} in ${constructor.name}`);
        });

        return new constructor(...dependencies);
    }

    /**
     * Checks if the given function is a class constructor.
     *
     * @param {Function} fn - The function to inspect.
     * @returns {boolean} - True if it's a class, false otherwise.
     */
    protected isClass(fn: Function): boolean {
        return typeof fn === 'function' && /^class\s/.test(Function.prototype.toString.call(fn));
    }

    /**
     * Resolve an abstract type from the container.
     * Automatically builds or reuses instances, and supports parameter overrides.
     *
     * @template T
     * @param {Abstract<T>} abstract - The abstract identifier.
     * @param {Record<string, any>} [parameters={}] - Optional constructor overrides.
     * @returns {T} - The resolved concrete instance.
     */
    public make<T>(abstract: Abstract<T>, parameters: Record<string, any> = {}): T {
        if (this.instances.has(abstract)) return this.instances.get(abstract);
        const concrete = this.getConcrete(abstract);
        const object = this.isBuildable(concrete, abstract) ? this.build<T>(concrete, parameters) : this.make<T>(concrete as Abstract<T>);
        if (this.isShared(abstract)) this.instances.set(abstract, object);
        this.resolved.add(abstract);
        return object;
    }

    /**
     * Register a singleton binding — only one instance will ever be created.
     *
     * @template T
     * @param {Abstract<T>} abstract - The abstract identifier.
     * @param {Concrete<T>['value']} concrete - The concrete factory/class.
     */
    public singleton<T>(abstract: Abstract<T>, concrete: Concrete<T>['value']): void {
        this.bind(abstract, concrete, true);
    }

    /**
     * Directly register an existing instance to an abstract identifier.
     *
     * @template T
     * @param {Abstract<T>} abstract - The abstract identifier.
     * @param {T} instance - The existing object instance.
     */
    public instance<T>(abstract: Abstract<T>, instance: T): void {
        this.instances.set(abstract, instance);
        this.resolved.add(abstract);
    }

    /**
     * Get the concrete binding value for a given abstract.
     *
     * @template T
     * @param {Abstract<T>} abstract - The abstract identifier.
     * @returns {Concrete<T>['value']} - The concrete constructor or closure.
     */
    protected getConcrete<T = any>(abstract: Abstract<T>): Concrete<T>['value'] {
        const binding = this.bindings.get(abstract);
        if (binding) {
            return binding.value;
        }
        return abstract as Concrete<T>['value'];
    }

    /**
     * Determine whether a binding is marked as shared (singleton).
     *
     * @template T
     * @param {Abstract<T>} abstract - The abstract identifier.
     * @returns {boolean} - True if the binding is a singleton.
     */
    public isShared<T>(abstract: Abstract<T>): boolean {
        return this.bindings.get(abstract)?.shared ?? false;
    }

    /**
     * Check whether the given concrete is buildable (constructor or closure).
     *
     * @template T
     * @param {Concrete<T>['value']} concrete - The concrete implementation.
     * @param {Abstract<T>} abstract - The original abstract identifier.
     * @returns {boolean} - True if container should build it directly.
     */
    public isBuildable<T>(concrete: Concrete<T>['value'], abstract: Abstract<T>): boolean {
        return concrete === abstract || typeof concrete === 'function';
    }

    /**
     * Determine if the container has a binding or instance for the given abstract.
     *
     * @template T
     * @param {Abstract<T>} abstract - The abstract identifier.
     * @returns {boolean} - True if bound or resolved.
     */
    public has<T>(abstract: Abstract<T>): boolean {
        return this.bindings.has(abstract) || this.instances.has(abstract);
    }

    /**
     * Get the full concrete binding (factory/class + metadata).
     *
     * @template T
     * @param {Abstract<T>} abstract - The abstract identifier.
     * @returns {Concrete} - The full binding object or abstract as fallback.
     */
    protected getBindings<T = any>(abstract: Abstract<T>): Concrete {
        const binding = this.bindings.get(abstract);
        if (binding) {
            return binding;
        }
        return abstract as unknown as Concrete;
    }
}
