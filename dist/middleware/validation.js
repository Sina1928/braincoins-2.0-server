export const validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;
    const errors = [];
    if (!username || username.length < 3) {
        errors.push({
            field: "username",
            message: "Username must be at least 3 characters long",
        });
    }
    if (!email || !email.includes("@")) {
        errors.push({
            field: "email",
            message: "Valid email is required",
        });
    }
    if (!password || password.length < 6) {
        errors.push({
            field: "password",
            message: "Password must be at least 6 characters long",
        });
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    if (!email || !email.includes("@")) {
        errors.push({
            field: "email",
            message: "Valid email is required",
        });
    }
    if (!password) {
        errors.push({
            field: "password",
            message: "Password is required",
        });
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};
//# sourceMappingURL=validation.js.map