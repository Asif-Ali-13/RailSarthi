const { Router } = require("express");
const userRouter = Router();

const { userMiddleware } = require("../middlewares/user");

const { 
    signupUser, 
    signinUser,
    getUserProfile,
    updateUserProfile,
    resetUserPassword,
    getAllTrains,
    getTrainDetails,
    getAllStations,
    getTrainStations,
    bookTicket,
    getTicketDetails,
    getUserTickets,
    cancelTicket,
    initiatePayment,
    getPaymentStatus
} = require("../controllers/user");

// Authentication & Profile routes
userRouter.post("/signup", signupUser);
userRouter.post("/signin", signinUser);
userRouter.get("/profile", userMiddleware, getUserProfile);
userRouter.put("/update-profile", userMiddleware, updateUserProfile);
userRouter.put("/reset-password", userMiddleware, resetUserPassword);

// Train & Station Information routes
userRouter.get("/trains", userMiddleware, getAllTrains);
userRouter.get("/trains/:trainId", userMiddleware, getTrainDetails);
userRouter.get("/stations", userMiddleware, getAllStations);
userRouter.get("/stations/:trainId", userMiddleware, getTrainStations);

// Ticket Management routes
userRouter.post("/book-ticket", userMiddleware, bookTicket);
userRouter.get("/tickets/:ticketId", userMiddleware, getTicketDetails);
userRouter.get("/tickets", userMiddleware, getUserTickets);
userRouter.delete("/tickets/:ticketId", userMiddleware, cancelTicket);

// Payment routes
userRouter.post("/payment/initiate", userMiddleware, initiatePayment);
userRouter.get("/payment/status/:paymentId", userMiddleware, getPaymentStatus);

module.exports = { userRouter };


