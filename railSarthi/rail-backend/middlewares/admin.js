const jwt = require("jsonwebtoken");

const adminMiddleware = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(401).json({
            message: "Invalid token"
        });
    }
};

exports.adminMiddleware = adminMiddleware;