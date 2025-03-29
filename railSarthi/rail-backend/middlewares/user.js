const jwt = require("jsonwebtoken");

const userMiddleware = async (req, res, next) => {
    // Extract token from Authorization header
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    try {
        // Verify token with JWT secret
        const decoded = await jwt.verify(token, process.env.JWT_USER_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token",
            error
        });
    }
};

exports.userMiddleware = userMiddleware;
