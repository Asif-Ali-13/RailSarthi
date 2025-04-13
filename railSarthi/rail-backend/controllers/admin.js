const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


/**
method : POST
route : /api/v1/admin/signin
description : admin login
*/

const adminSignIn = async (req, res) => {
    const requireBody = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(3).max(100)
    });
       
    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        });
    }

    const { email, password } = req.body;
    const admin = await client.admin.findUnique({
        where: { email }
    });
    
    if (!admin) {
        return res.status(400).json({
            message: "Invalid email"
        });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
        return res.status(400).json({
            message: "Invalid password"
        });
    }
    
    const token = jwt.sign({ AdminId: admin.id }, process.env.JWT_ADMIN_SECRET);
    res.json({
        message: "You are signed in",
        token
    });
};

/**
method : GET
route : /api/v1/admin/profile
description : to get admin profile
*/

const adminProfile = async (req, res) => {
    const { AdminId } = req.admin;
    const admin = await client.admin.findUnique({
        where: { id: AdminId },
        include: {
            city: true // Include the Location data
        }
    });

    if (!admin) {
        return res.status(400).json({
            message: "Invalid user"
        });
    }

    const profile = {
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        city: admin.city.city, // Get city from Location relation
        state: admin.city.state, // Get state from Location relation
        gender: admin.gender,
        age: admin.age
    }
    
    res.json({
        message: "Your Profile details",
        profile
    });
};

/**
method : PUT
route : /api/v1/admin/update-profile
description : to update admin profile
*/

const updateAdminProfile = async (req, res) => {
    const requireBody = z.object({
        firstName: z.string().min(3).max(30).optional(),
        lastName: z.string().min(3).max(30).optional(),
        email: z.string().min(3).max(100).email().optional(),
        city: z.string().min(3).max(50).optional(),
        state: z.string().min(3).max(50).optional(),
        gender: z.enum(["male", "female", "other"]).optional(), // Updated to match schema enum
        age: z.number().int().max(120).optional()
    });
       
    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        });
    }
    
    const { AdminId } = req.admin;
    const admin = await client.admin.findUnique({
        where: { id: AdminId },
        include: {
            city: true // Include the Location data
        }
    });

    if (!admin) {
        return res.status(400).json({
            message: "Invalid user"
        });
    }

    const { firstName, lastName, email, city, state, gender, age } = req.body;
    const updateData = {};

    // Handle basic field updates
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (gender) updateData.gender = gender;
    if (age) updateData.age = age;

    // Handle email update with duplicate check
    if (email) {
        const existingAdmin = await client.admin.findFirst({
            where: {
                email,
                NOT: {
                    id: AdminId
                }
            }
        });

        if (existingAdmin) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }
        updateData.email = email;
    }

    // Handle city and state update
    if (city || state) {
        // Search for existing location with new city/state combination
        const newLocation = await client.location.findFirst({
            where: {
                AND: [
                    { 
                        city: { 
                            equals: city || admin.city.city, 
                            mode: 'insensitive' 
                        }
                    },
                    { 
                        state: { 
                            equals: state || admin.city.state, 
                            mode: 'insensitive' 
                        }
                    }
                ]
            }
        });

        if (newLocation) {
            // Use existing location
            updateData.cityId = newLocation.id;
        } else {
            // Create new location
            const createdLocation = await client.location.create({
                data: {
                    city: city || admin.city.city,
                    state: state || admin.city.state
                }
            });
            updateData.cityId = createdLocation.id;
        }
    }

    // Perform the update
    await client.admin.update({
        where: { id: AdminId },
        data: updateData
    });

    res.json({
        message: "Your profile details updated"
    });
};

/**
method : PUT
route : /api/v1/admin/reset-password
description : to reset admin password
*/

const resetAdminPassword = async (req, res) => {
    const requireBody = z.object({
        oldPassword: z.string().min(3).max(100),
        newPassword: z.string().min(3).max(100)
    });
       
    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        });
    }
    
    const { AdminId } = req.admin;
    const admin = await client.admin.findUnique({
        where: { id: AdminId }
    });

    if (!admin) {
        return res.status(400).json({
            message: "Invalid user"
        });
    }

    const { oldPassword, newPassword } = req.body;

    if (await bcrypt.compare(oldPassword, admin.password) === false) {
        return res.status(400).json({
            message: "Invalid password"
        });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await client.admin.update({
        where: { id: AdminId },
        data: { password: hashedPassword }
    });

    res.json({
        message: "Your password updated"
    });
};

/**
method : POST
route : /api/v1/admin/addAdmin
description : to add a new admin
*/

const addNewAdmin = async (req, res) => {
    const requireBody = z.object({
        firstName: z.string().min(3).max(30),
        lastName: z.string().min(3).max(30),
        email: z.string().min(3).max(100).email(),
        password: z.string().min(3).max(100),
        city: z.string().min(3).max(50),
        state: z.string().min(3).max(50),
        gender: z.enum(["male", "female", "other"]),
        age: z.number().int().max(120)
    });

    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        });
    }

    const { email, city, state, password } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await client.admin.findUnique({
        where: { email }
    });

    if (existingAdmin) {
        return res.status(400).json({
            message: "Email already exists"
        });
    }

    // Check if location exists or create new one
    let location = await client.location.findFirst({
        where: {
            AND: [
                { city: { equals: city, mode: 'insensitive' } },
                { state: { equals: state, mode: 'insensitive' } }
            ]
        }
    });

    if (!location) {
        // Create new location if it doesn't exist
        location = await client.location.create({
            data: {
                city,
                state
            }
        });
    }

    const { firstName, lastName, age, gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.admin.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            cityId: location.id,
            gender,
            age,
            createdByAdmin: req.admin.AdminId
        }
    });

    res.json({
        message: "New admin added"
    });
};

/**
method : GET
route : /api/v1/admin/stations
description : to get all stations
*/

const getAllStations = async (req, res) => {
    try {
        const stations = await client.station.findMany({
            include: {
                city: true
            }
        });

        // Format station data
        const formattedStations = stations.map(station => ({
            id: station.id,
            name: station.name,
            city: station.city.city,
            state: station.city.state
        }));

        res.json({
            message: "All stations",
            stations: formattedStations
        });
    } catch (error) {
        console.error("Error in getAllStations:", error);
        res.status(500).json({
            message: "Error retrieving stations",
            error: error.message
        });
    }
};

/**
method : POST
route : /api/v1/admin/stations
description : to add a new station
*/

const addStation = async (req, res) => {
    const requireBody = z.object({
        name: z.string().min(3).max(50),
        city: z.string().min(3).max(50),
        state: z.string().min(3).max(50)
    });

    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        });
    }

    const { name, city, state } = req.body;

    // Check if station with same name already exists
    const existingStation = await client.station.findFirst({
        where: {
            name: {
                equals: name,
                mode: 'insensitive'
            }
        }
    });

    if (existingStation) {
        return res.status(400).json({
            message: "Station with this name already exists"
        });
    }

    // Check if location exists or create new one
    let location = await client.location.findFirst({
        where: {
            AND: [
                { city: { equals: city, mode: 'insensitive' } },
                { state: { equals: state, mode: 'insensitive' } }
            ]
        }
    });

    if (!location) {
        // Create new location if it doesn't exist
        location = await client.location.create({
            data: {
                city,
                state
            }
        });
    }

    // Create new station
    const newStation = await client.station.create({
        data: {
            name,
            cityId: location.id
        }
    });

    res.status(201).json({
        message: "Station added successfully",
        station: {
            id: newStation.id,
            name: newStation.name,
            city,
            state
        }
    });
};

/**
method : GET
route : /api/v1/admin/trains
description : to get all trains
*/

const getAllTrains = async (req, res) => {
    try {
        const trains = await client.train.findMany({
            include: {
                routes: {
                    include: {
                        station: {
                            include: {
                                city: true
                            }
                        }
                    },
                    orderBy: {
                        stopNo: 'asc'
                    }
                },
                coaches: {
                    include: {
                        _count: {
                            select: { seats: true }
                        }
                    }
                }
            }
        });

        // Format train data
        const formattedTrains = trains.map(train => ({
            id: train.id,
            name: train.trainName,
            status: train.status,
            sourceStation: train.routes[0]?.station.name || 'Unknown',
            destinationStation: train.routes[train.routes.length - 1]?.station.name || 'Unknown',
            totalCoaches: train.noOfCoaches,
            totalSeats: train.noOfSeats,
            routes: train.routes.map(route => ({
                stopNo: route.stopNo,
                stationName: route.station.name,
                city: route.station.city.city,
                arrival: route.arrival ? new Date(route.arrival).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
                departure: route.departure ? new Date(route.departure).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null
            }))
        }));

        res.json({
            message: "All trains",
            trains: formattedTrains
        });
    } catch (error) {
        console.error("Error in getAllTrains:", error);
        res.status(500).json({
            message: "Error retrieving trains",
            error: error.message
        });
    }
};

/**
method : POST
route : /api/v1/admin/trains
description : to add a new train
*/

const addTrain = async (req, res) => {
    const requireBody = z.object({
        trainName: z.string().min(3).max(50),
        sourceStationId: z.number().int(),
        destStationId: z.number().int(),
        noOfCoaches: z.number().int().min(1),
        noOfSeats: z.number().int().min(1),
        locoPilotId: z.number().int(),
        status: z.enum(["on_time", "late", "cancelled"]).default("on_time")
    });

    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        });
    }

    const { trainName, sourceStationId, destStationId, noOfCoaches, noOfSeats, locoPilotId, status } = req.body;

    // Check if source and destination stations exist
    const sourceStation = await client.station.findUnique({
        where: { id: sourceStationId },
        include: {
            city: true
        }
    });

    const destStation = await client.station.findUnique({
        where: { id: destStationId },
        include: {
            city: true
        }
    });

    if (!sourceStation || !destStation) {
        return res.status(404).json({
            message: "Source or destination station not found"
        });
    }

    // Check if loco pilot exists and has the correct role
    const locoPilot = await client.employee.findFirst({
        where: {
            id: locoPilotId,
            role: "loco_pilot"
        }
    });

    if (!locoPilot) {
        return res.status(404).json({
            message: "Loco pilot not found or employee is not a loco pilot"
        });
    }

    try {
        // Get current date for creating ISO-8601 DateTime
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Create new train with routes
        const newTrain = await client.train.create({
            data: {
                trainName,
                sourceStId: sourceStationId,
                destStId: destStationId,
                noOfCoaches,
                noOfSeats,
                locoPilotId,
                status,
                routes: {
                    create: [
                        {
                            stopNo: 1,
                            stationId: sourceStationId,
                            arrival: null,
                            departure: `${todayStr}T00:00:00.000Z`
                        },
                        {
                            stopNo: 2,
                            stationId: destStationId,
                            arrival: `${todayStr}T23:59:00.000Z`,
                            departure: null
                        }
                    ]
                }
            },
            include: {
                routes: {
                    include: {
                        station: {
                            include: {
                                city: true
                            }
                        }
                    }
                }
            }
        });

        // Format the response
        const formattedTrain = {
            id: newTrain.id,
            name: newTrain.trainName,
            status: newTrain.status,
            sourceStation: newTrain.routes[0]?.station.name || 'Unknown',
            destinationStation: newTrain.routes[1]?.station.name || 'Unknown',
            totalCoaches: newTrain.noOfCoaches,
            totalSeats: newTrain.noOfSeats,
            routes: newTrain.routes.map(route => ({
                stopNo: route.stopNo,
                stationName: route.station.name,
                city: route.station.city.city,
                arrival: route.arrival ? new Date(route.arrival).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
                departure: route.departure ? new Date(route.departure).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null
            }))
        };

        res.status(201).json({
            message: "Train added successfully",
            train: formattedTrain
        });
    } catch (error) {
        console.error("Error creating train:", error);
        res.status(500).json({
            message: "Failed to create train",
            error: error.message
        });
    }
};

/**
method : GET
route : /api/v1/admin/employees
description : to get all employees
*/

const getAllEmployees = async (req, res) => {
    try {
        const employees = await client.employee.findMany({
            include: {
                city: true
            }
        });

        // Format employee data
        const formattedEmployees = employees.map(employee => ({
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            role: employee.role,
            city: employee.city.city,
            state: employee.city.state,
            gender: employee.gender,
            age: employee.age
        }));

        res.json({
            message: "All employees",
            employees: formattedEmployees
        });
    } catch (error) {
        console.error("Error in getAllEmployees:", error);
        res.status(500).json({
            message: "Error retrieving employees",
            error: error.message
        });
    }
};

/**
method : POST
route : /api/v1/admin/employees
description : to add a new employee
*/

const addEmployee = async (req, res) => {
    const requireBody = z.object({
        firstName: z.string().min(3).max(30),
        lastName: z.string().min(3).max(30),
        email: z.string().min(3).max(100).email(),
        password: z.string().min(3).max(100),
        role: z.enum(["manager", "station_manager", "booking_clerk", "loco_pilot"]),
        city: z.string().min(3).max(50),
        state: z.string().min(3).max(50),
        gender: z.enum(["male", "female", "other"]),
        age: z.number().int().max(120)
    });

    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        });
    }

    const { email, city, state, password } = req.body;
    
    // Check if employee already exists
    const existingEmployee = await client.employee.findUnique({
        where: { email }
    });

    if (existingEmployee) {
        return res.status(400).json({
            message: "Email already exists"
        });
    }

    // Check if location exists or create new one
    let location = await client.location.findFirst({
        where: {
            AND: [
                { city: { equals: city, mode: 'insensitive' } },
                { state: { equals: state, mode: 'insensitive' } }
            ]
        }
    });

    if (!location) {
        // Create new location if it doesn't exist
        location = await client.location.create({
            data: {
                city,
                state
            }
        });
    }

    const { firstName, lastName, role, gender, age } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new employee
    const newEmployee = await client.employee.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            cityId: location.id,
            gender,
            age
        }
    });

    res.status(201).json({
        message: "Employee added successfully",
        employee: {
            id: newEmployee.id,
            firstName: newEmployee.firstName,
            lastName: newEmployee.lastName,
            email: newEmployee.email,
            role: newEmployee.role,
            city,
            state,
            gender: newEmployee.gender,
            age: newEmployee.age
        }
    });
};

/**
method : DELETE
route : /api/v1/admin/trains/:id
description : to delete a train
*/

const deleteTrain = async (req, res) => {
    try {
        const trainId = parseInt(req.params.id);
        
        if (isNaN(trainId)) {
            return res.status(400).json({
                message: "Invalid train ID"
            });
        }

        // Check if train exists
        const train = await client.train.findUnique({
            where: { id: trainId },
            include: {
                routes: true,
                coaches: true,
                schedules: true,
                trips: true,
                shifts: true
            }
        });

        if (!train) {
            return res.status(404).json({
                message: "Train not found"
            });
        }

        // Delete all related records first
        // Delete train routes
        await client.trainRoute.deleteMany({
            where: { trainId }
        });

        // Delete schedules
        await client.schedule.deleteMany({
            where: { trainId }
        });

        // Delete shifts
        await client.shift.deleteMany({
            where: { trainId }
        });

        // Delete trips
        await client.trip.deleteMany({
            where: { trainId }
        });

        // Delete coaches and their seats
        for (const coach of train.coaches) {
            // Delete seats in the coach
            await client.seat.deleteMany({
                where: { coachId: coach.id }
            });
        }

        // Delete coaches
        await client.coach.deleteMany({
            where: { trainId }
        });

        // Finally, delete the train
        await client.train.delete({
            where: { id: trainId }
        });

        res.json({
            message: "Train deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting train:", error);
        res.status(500).json({
            message: "Failed to delete train",
            error: error.message
        });
    }
};

/**
method : DELETE
route : /api/v1/admin/stations/:id
description : to delete a station
*/

const deleteStation = async (req, res) => {
    try {
        const stationId = parseInt(req.params.id);
        
        if (isNaN(stationId)) {
            return res.status(400).json({
                message: "Invalid station ID"
            });
        }

        // Check if station exists
        const station = await client.station.findUnique({
            where: { id: stationId },
            include: {
                trainRoutes: true,
                tripsBoarding: true,
                tripsDestination: true,
                schedules: true,
                shifts: true
            }
        });

        if (!station) {
            return res.status(404).json({
                message: "Station not found"
            });
        }

        // Delete all related records first
        // Delete train routes
        await client.trainRoute.deleteMany({
            where: { stationId }
        });

        // Delete schedules
        await client.schedule.deleteMany({
            where: { stationId }
        });

        // Delete shifts
        await client.shift.deleteMany({
            where: { stationId }
        });

        // Delete trips where this station is either boarding or destination
        await client.trip.deleteMany({
            where: {
                OR: [
                    { boardingStId: stationId },
                    { destId: stationId }
                ]
            }
        });

        // Finally, delete the station
        await client.station.delete({
            where: { id: stationId }
        });

        res.json({
            message: "Station deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting station:", error);
        res.status(500).json({
            message: "Failed to delete station",
            error: error.message
        });
    }
};

/**
method : DELETE
route : /api/v1/admin/employees/:id
description : to delete an employee
*/

const deleteEmployee = async (req, res) => {
    try {
        const employeeId = parseInt(req.params.id);
        
        if (isNaN(employeeId)) {
            return res.status(400).json({
                message: "Invalid employee ID"
            });
        }

        // Check if employee exists
        const employee = await client.employee.findUnique({
            where: { id: employeeId },
            include: {
                shifts: true
            }
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        // Delete all related records first
        // Delete shifts
        await client.shift.deleteMany({
            where: { employeeId }
        });

        // Finally, delete the employee
        await client.employee.delete({
            where: { id: employeeId }
        });

        res.json({
            message: "Employee deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).json({
            message: "Failed to delete employee",
            error: error.message
        });
    }
};

module.exports = { 
    adminSignIn, 
    adminProfile, 
    updateAdminProfile, 
    resetAdminPassword,
    addNewAdmin,
    getAllStations,
    addStation,
    deleteStation,
    getAllTrains,
    addTrain,
    deleteTrain,
    getAllEmployees,
    addEmployee,
    deleteEmployee
};
