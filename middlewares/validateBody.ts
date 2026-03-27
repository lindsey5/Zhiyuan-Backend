import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError, TypeOf } from "zod";

const validateBody = <T extends ZodSchema<any>>(schema: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed: TypeOf<T> = schema.parse(req.body);
            req.body = parsed;
            next();
        } catch (err) {
            console.log(err)
            if (err instanceof ZodError) {
                res.status(400).json({
                    message: "Validation failed",
                    errors: err.issues, 
                });
                return;
            }
            next(err);
        }
    };
};

export default validateBody