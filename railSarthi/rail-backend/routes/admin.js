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
    addEmployee
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

// Train management routes
adminRouter.get("/trains", adminMiddleware, getAllTrains);
adminRouter.post("/trains", adminMiddleware, addTrain);
adminRouter.delete("/trains/:id", adminMiddleware, deleteTrain);

// Employee management routes
adminRouter.get("/employees", adminMiddleware, getAllEmployees);
adminRouter.post("/employees", adminMiddleware, addEmployee);

module.exports = { adminRouter };

