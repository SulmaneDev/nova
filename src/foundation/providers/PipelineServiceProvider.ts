import { ServiceProvider } from '../provider.js';
import { Pipeline } from '../pipeline.js';

/**
 * Service provider responsible for registering and bootstrapping
 * the application's event emitter service.
 *
 * This provider binds the Pipeline class as a singleton into
 * the application container during the boot phase, making it
 * available throughout the app via dependency injection.
 */
export class EventServiceProvider extends ServiceProvider {
    /**
     * Bootstrap any application services.
     *
     * This method is called after all service providers have been registered,
     * making it ideal for performing actions like binding event listeners
     * or publishing resources. Here, it registers the Pipeline as a singleton.
     *
     * @returns {void}
     */
    boot(): void {
        this.app.singleton(Pipeline, Pipeline);
    }

    /**
     * Register any application services.
     *
     * This method should be used to bind things into the service container.
     * Left empty in this provider as no services need to be registered here.
     *
     * @returns {void}
     */
    register(): void {}
}
