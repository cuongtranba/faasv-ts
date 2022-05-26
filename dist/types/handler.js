"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userHandler = {
    Subject: "hello",
    Queue: "worker",
    Func: (req) => {
        return {
            age: "20",
        };
    },
};
const caller = ();
const value = caller(userHandler, { name: "hello" });
//# sourceMappingURL=handler.js.map