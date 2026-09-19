const { ZodError } = require('zod');

const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({ error: 'Validation Error', details: err.errors });
            }
            next(err);
        }
    };
};

module.exports = { validateBody };
