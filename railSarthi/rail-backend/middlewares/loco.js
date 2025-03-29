const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

const locoMiddleware = async (req, res, next) => {
    const locoId = req.emp.empId;

    if (!locoId) {
        return res.status(401).json({
            message: "No pilot id provided"
        });
    }

    try {
        const idExist = await client.employee.findUnique({ where: { id: locoId } });

        if(!idExist || idExist.role !== "loco_pilot"){
            return res.status(401).json({
                message: "Invalid pilot id"
            });
        }

        req.pilotId = idExist.id;
        next();
    } catch (err) {
        res.status(401).json({
            message: "Invalid loco pilot",
        });
    }
};

exports.locoMiddleware = locoMiddleware;