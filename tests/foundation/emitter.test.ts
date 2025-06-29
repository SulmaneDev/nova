import { Emitter, EventMap } from '../../src/foundation/emitter';

describe('Emitter', () => {
    let emitter: Emitter;

    beforeEach(() => {
        emitter = new Emitter();
    });

    it('should emit and listen to "app.booting" event with empty payload', () => {
        const listener = jest.fn();

        emitter.on('app.booting', listener);
        emitter.emit('app.booting', {});

        expect(listener).toHaveBeenCalledWith({});
    });

    it('should emit and listen to "container.resolving" with correct payload', () => {
        const payload: EventMap['container.resolving'] = {
            abstract: 'LoggerService',
            instance: { foo: 'bar' },
        };
        const listener = jest.fn();

        emitter.on('container.resolving', listener);
        emitter.emit('container.resolving', payload);

        expect(listener).toHaveBeenCalledWith(payload);
    });

    it('should dispatch event using dispatch() instead of emit()', () => {
        const listener = jest.fn();
        const payload: EventMap['request.received'] = {
            method: 'GET',
            url: '/api/users',
        };

        emitter.on('request.received', listener);
        emitter.dispatch('request.received', payload);

        expect(listener).toHaveBeenCalledWith(payload);
    });

    it('should handle "exception.thrown" event with Error object', () => {
        const error = new Error('Something went wrong');
        const listener = jest.fn();

        emitter.on('exception.thrown', listener);
        emitter.emit('exception.thrown', { error });

        expect(listener).toHaveBeenCalledWith({ error });
        expect(listener.mock.calls[0][0].error).toBeInstanceOf(Error);
        expect(listener.mock.calls[0][0].error.message).toBe('Something went wrong');
    });

    it('should allow multiple listeners on same event', () => {
        const l1 = jest.fn();
        const l2 = jest.fn();

        emitter.on('app.booted', l1);
        emitter.on('app.booted', l2);
        emitter.dispatch('app.booted', {});

        expect(l1).toHaveBeenCalled();
        expect(l2).toHaveBeenCalled();
    });
});
