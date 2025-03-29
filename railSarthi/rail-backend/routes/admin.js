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
    addTrain
} = require("../controllers/admin");

// Authentication routes
adminRouter.post("/signin", adminSignIn);
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

module.exports = { adminRouter };

