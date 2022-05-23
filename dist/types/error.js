class FooError extends Error {
    constructor(msg) {
        super(msg);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, FooError.prototype);
    }
    sayHello() {
        return "hello " + this.message;
    }
}
//# sourceMappingURL=error.js.map