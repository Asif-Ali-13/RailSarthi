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

/**
Employee Endpoints

Authentication & Profile
POST /signin - Employee login (no middleware)
GET /profile - Get employee profile (empMiddleware)
PUT /update-profile - Update employee profile (empMiddleware)
PUT /reset-password - Reset employee password (empMiddleware)
GET /shifts - Get employee's shifts (empMiddleware)

Manager Routes (all require empMiddleware)
GET /m/employees - Get all employees
POST /m/addEmployee - Add new employee
GET /m/employees/:empId - Get specific employee details
PUT /m/employees/:empId/update-role - Update employee role
DELETE /m/employees/:empId - Remove employee

Station Manager Routes (all require empMiddleware)
GET /sm/trains - Get all trains for station
GET /sm/trains/:trainId - Get specific train details
POST /sm/schedule - Add new schedule
PUT /sm/schedule/:id - Update schedule
DELETE /sm/schedule/:id - Remove schedule

Loco Pilot Routes
GET /lp/trains - Get assigned trains (empMiddleware + locoMiddleware)
*/



