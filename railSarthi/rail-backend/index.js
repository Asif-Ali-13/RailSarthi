require('dotenv').config()
const express = require("express");
const { userRouter } = require("./routes/user");
const { empRouter } = require("./routes/emp");
const { adminRouter } = require("./routes/admin");
const cors = require('cors');

const app = express();

// CORS configuration for development
app.use(cors({
    origin: 'http://localhost:5173', // Allow only your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true // Allow credentials (cookies, authorization headers)
}));

app.use(express.json());

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/emp", empRouter);
app.use("/api/v1/admin", adminRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

async function main() {
    const port = process.env.PORT || 5000;
    console.log("Server is running on port", port);
    app.listen(port);
}

main()


