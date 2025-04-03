const jwt = require("jsonwebtoken");

const adminMiddleware = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

    if (!token) {
        console.log("No token provided");
        return res.status(401).json({
            message: "No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        console.log("Invalid token error from admin middleware :", err);
        res.status(401).json({
            message: "Invalid token"
        });
    }
};

exports.adminMiddleware = adminMiddleware;