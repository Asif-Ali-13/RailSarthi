const { Router } = require("express");
const adminRouter = Router();

const { adminMiddleware } = require("../middlewares/admin");

const {
    adminSignIn,
    adminProfile,
    updateAdminProfile,
    resetAdminPassword,
    addNewAdmin,
    getAllStations,
    addStation,
    getAllTrains,
    addTrain,
    deleteTrain,
    getAllEmployees,
    addEmployee,
    deleteStation,
    deleteEmployee,
    getEmployee,
    updateEmployee
} = require("../controllers/admin");

// Authentication routes
adminRouter.post("/signin", adminSignIn);

// Profile routes
adminRouter.get("/profile", adminMiddleware, adminProfile);
adminRouter.put("/update-profile", adminMiddleware, updateAdminProfile);
adminRouter.put("/reset-password", adminMiddleware, resetAdminPassword);
adminRouter.post("/addAdmin", adminMiddleware, addNewAdmin);

// Station management routes
adminRouter.get("/stations", adminMiddleware, getAllStations);
adminRouter.post("/stations", adminMiddleware, addStation);
adminRouter.delete("/stations/:id", adminMiddleware, deleteStation);

// Train management routes
adminRouter.get("/trains", adminMiddleware, getAllTrains);
adminRouter.post("/trains", adminMiddleware, addTrain);
adminRouter.delete("/trains/:id", adminMiddleware, deleteTrain);

// Employee management routes
adminRouter.get("/employees", adminMiddleware, getAllEmployees);
adminRouter.post("/employees", adminMiddleware, addEmployee);
adminRouter.delete("/employees/:id", adminMiddleware, deleteEmployee);
adminRouter.get("/employees/:id", adminMiddleware, getEmployee);
adminRouter.put("/employees/:id", adminMiddleware, updateEmployee);

module.exports = { adminRouter };

