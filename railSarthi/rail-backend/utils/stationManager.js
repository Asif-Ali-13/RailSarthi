const { PrismaClient } = require("@prisma/client");
const emp = require("../routes/emp");
const client = new PrismaClient();

 async function isStationManager(id){
    const emp = await client.StationManager.findUnique({
        where: { employeeId: id }
    });

    if(!emp){
        return null;
    }

    return emp.stationId;
};

exports.isStationManager = isStationManager;