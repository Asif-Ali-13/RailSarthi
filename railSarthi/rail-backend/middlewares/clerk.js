const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

const bookingMiddleware = async (req, res, next) => {
    const clerkId = req.emp.empId;

    if (!clerkId) {
        return res.status(401).json({
            message: "No clerk id provided"
        });
    }

    try {
        const idExist = await client.employee.findUnique({ where: { id: clerkId } });

        if(!idExist || idExist.role !== "booking_clerk"){
            return res.status(401).json({
                message: "Invalid boloking clerk id",
            });
        }

        req.bookingId = idExist.id;
        next();
    } catch (err) {
        res.status(401).json({
            message: "Invalid booking clerk",
        });
    }
};

exports.bookingMiddleware = bookingMiddleware;