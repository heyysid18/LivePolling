"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const errorHandler_1 = require("./errorHandler");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Pass it to the global error handler
                error.name = 'ZodError';
                next(error);
            }
            else {
                next(new errorHandler_1.AppError('Internal validation error', 500));
            }
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validateRequest.js.map