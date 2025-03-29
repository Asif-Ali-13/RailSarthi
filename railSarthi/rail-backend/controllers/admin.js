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

    const { email, city, state } = req.body;
    
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

    const { password, firstName, lastName, age, gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.admin.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            cityId: location.id, // Use location ID
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

    res.json({
        message: "All trains",
        trains
    });
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
        where: { id: sourceStationId }
    });

    const destStation = await client.station.findUnique({
        where: { id: destStationId }
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

    // Create new train
    const newTrain = await client.train.create({
        data: {
            trainName,
            sourceStId: sourceStationId,
            destStId: destStationId,
            noOfCoaches,
            noOfSeats,
            locoPilotId,
            status
        }
    });

    res.status(201).json({
        message: "Train added successfully",
        train: newTrain
    });
};

module.exports = { 
    adminSignIn, 
    adminProfile, 
    updateAdminProfile, 
    resetAdminPassword,
    addNewAdmin,
    getAllStations,
    addStation,
    getAllTrains,
    addTrain
};
