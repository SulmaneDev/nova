import { ServiceProvider } from '../provider.js';
import { NovaEmitter } from '../emitter.js';

/**
 * Service provider responsible for registering and bootstrapping
 * the application's event emitter service.
 *
 * This provider binds the NovaEmitter class as a singleton into
 * the application container during the boot phase, making it
 * available throughout the app via dependency injection.
 */
export class EventServiceProvider extends ServiceProvider {
    /**
     * Bootstrap any application services.
     *
     * This method is called after all service providers have been registered,
     * making it ideal for performing actions like binding event listeners
     * or publishing resources. Here, it registers the NovaEmitter as a singleton.
     *
     * @returns {void}
     */
    boot(): void {
        this.app.singleton(NovaEmitter, NovaEmitter);
    }

    /**
     * Register any application services.
     *
     * This method should be used to bind things into the service container.
     * Left empty in this provider as no services need to be registered here.
     *
     * @returns {void}
     */
    register(): void {
    }
}
