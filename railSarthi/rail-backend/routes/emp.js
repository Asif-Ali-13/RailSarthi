const { Router } = require("express");
const empRouter = Router();

const { empMiddleware } = require("../middlewares/emp");
const { locoMiddleware } = require("../middlewares/loco");
const { bookingMiddleware } = require("../middlewares/clerk");

const { 
    empSignIn,
    empProfile,
    updateEmpProfile,
    resetEmpPassword,
    managerGetEmployeesInfo,
    managerAddEmployee,
    managerGetEmployeeDetails,
    managerUpdateEmployeeRole,
    managerRemoveEmployee,
    stationManagerGetTrains,
    stationManagerGetTrainDetails,
    stationManagerAddSchedule,
    stationManagerUpdateSchedule,
    stationManagerRemoveSchedule,
    getEmployeeShifts,
    locoPilotGetTrains
} = require("../controllers/emp");

// Authentication & Profile routes (no role-specific middleware needed)
empRouter.post("/signin", empSignIn);
empRouter.get("/profile", empMiddleware, empProfile);
empRouter.put("/update-profile", empMiddleware, updateEmpProfile);
empRouter.put("/reset-password", empMiddleware, resetEmpPassword);

// Employee Shifts route (accessible to all employees)
empRouter.get("/shifts", empMiddleware, getEmployeeShifts);

// Manager routes (requires employee middleware only as isManager check is in controller)
empRouter.get("/m/employees", empMiddleware, managerGetEmployeesInfo);
empRouter.post("/m/addEmployee", empMiddleware, managerAddEmployee);
empRouter.get("/m/employees/:empId", empMiddleware, managerGetEmployeeDetails);
empRouter.put("/m/employees/:empId/update-role", empMiddleware, managerUpdateEmployeeRole);
empRouter.delete("/m/employees/:empId", empMiddleware, managerRemoveEmployee);

// Station Manager routes (requires employee middleware as isStationManager check is in controller)
empRouter.get("/sm/trains", empMiddleware, stationManagerGetTrains);
empRouter.get("/sm/trains/:trainId", empMiddleware, stationManagerGetTrainDetails);
empRouter.post("/sm/schedule", empMiddleware, stationManagerAddSchedule);
empRouter.put("/sm/schedule/:id", empMiddleware, stationManagerUpdateSchedule);
empRouter.delete("/sm/schedule/:id", empMiddleware, stationManagerRemoveSchedule);

// Loco Pilot routes (requires both employee and loco pilot middleware)
empRouter.get("/lp/trains", empMiddleware, locoMiddleware, locoPilotGetTrains);

module.exports = { empRouter };

