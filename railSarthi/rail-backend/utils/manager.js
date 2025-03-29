const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

 async function isManager(managerId){
    const manager = await client.employee.findUnique({
        where: { id: managerId }
    });

    return manager.role === "manager";
};

exports.isManager = isManager;