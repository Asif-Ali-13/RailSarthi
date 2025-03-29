const jwt = require("jsonwebtoken");

const empMiddleware = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_EMP_SECRET);
        req.emp = decoded;
        next();
    } catch (err) {
        res.status(401).json({
            message: "Invalid token"
        });
    }
};

exports.empMiddleware = empMiddleware;