import { Container } from '../../src/foundation/container';

describe('Container - Non-Decorator Based DI', () => {
    let container: Container;

    beforeEach(() => {
        container = new Container();
    });

    it('binds and resolves a simple class', () => {
        class Foo {}
        container.bind(Foo, Foo);

        const instance = container.make(Foo);
        expect(instance).toBeInstanceOf(Foo);
    });

    it('resolves a class with constructor dependencies (manual bind)', () => {
        class Bar {}
        class Baz {
            constructor(public bar: Bar) {}
        }

        container.bind('bar', Bar); 
        container.bind(Baz, Baz);

        const instance = container.make(Baz);
        expect(instance).toBeInstanceOf(Baz);
        expect(instance.bar).toBeInstanceOf(Bar);
    });

    it('resolves nested dependencies', () => {
        class A {}
        class B {
            constructor(public a: A) {}
        }
        class C {
            constructor(public b: B) {}
        }

        container.bind('a', A);
        container.bind('b', B);
        container.bind(C, C);

        const instance = container.make(C);
        expect(instance).toBeInstanceOf(C);
        expect(instance.b).toBeInstanceOf(B);
        expect(instance.b.a).toBeInstanceOf(A);
    });

    it('overrides constructor parameters manually', () => {
        class Foo {
            constructor(public name: string) {}
        }

        container.bind(Foo, Foo);
        const instance = container.make(Foo, { name: 'Nova' });
        expect(instance).toBeInstanceOf(Foo);
        expect(instance.name).toBe('Nova');
    });

    it('creates a singleton', () => {
        class Bar {}
        container.singleton(Bar, Bar);
        const a = container.make(Bar);
        const b = container.make(Bar);
        expect(a).toBe(b); 
    });

    it('stores a direct instance', () => {
        class Foo {}
        const foo = new Foo();
        container.instance(Foo, foo);
        expect(container.make(Foo)).toBe(foo);
    });

    it('builds via closure (factory)', () => {
        container.bind('foo', () => 'hello');
        const foo = container.make('foo');
        expect(foo).toBe('hello');
    });
});
