const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
    method : POST
    route : /api/v1/user/signup
    description : to signup a user
*/

const signupUser = async (req, res) => {
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
    
    // Check if user already exists
    const existingUser = await client.user.findUnique({
        where: { email }
    });

    if (existingUser) {
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

    const { firstName, lastName, password, gender, age } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with the location ID
    await client.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            cityId: location.id, // Use location ID
            gender,
            age
        }
    });

    res.status(201).json({
        message: "You are signed up successfully"
    });
};

/**
    method : POST
    route : /api/v1/user/signin
    description : to signin a user
*/

const signinUser = async (req, res) => {
    const requireBody = z.object({
        email : z.string().min(3).max(100).email(),
        password : z.string().min(3).max(100)
    });
       
    
    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        res.json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        })
        return;
    }

    const { email, password } = req.body;
    const user = await client.user.findUnique({
        where: { email }
    });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_USER_SECRET);

    res.json({
        message: "You are signed in",
        token
    });
};

/**
    method : GET
    route : /api/v1/user/profile
    description : to get user profile
*/

const getUserProfile = async (req, res) => {
    const { userId } = req.user;

    const user = await client.user.findUnique({
        where: { id: userId },
        include: {
            city: true // Include the Location relation
        }
    });

    if (!user) {
        return res.status(400).json({
            message: "Invalid user"
        });
    }

    const profile = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        city: user.city.city, // Get city from Location relation
        state: user.city.state, // Get state from Location relation
        gender: user.gender,
        age: user.age
    }

    res.json({
        message: "Your Profile details",
        profile
    });
};

/**
    method : GET
    route : /api/v1/user/update-profile
    description : to update user's profile
*/

const updateUserProfile = async (req, res) => {
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
    
    const { userId } = req.user;
    const user = await client.user.findUnique({
        where: { id: userId },
        include: {
            city: true // Include the Location relation
        }
    });

    if (!user) {
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
        const existingUser = await client.user.findFirst({
            where: {
                email,
                NOT: {
                    id: userId
                }
            }
        });

        if (existingUser) {
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
                            equals: city || user.city.city, 
                            mode: 'insensitive' 
                        }
                    },
                    { 
                        state: { 
                            equals: state || user.city.state, 
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
                    city: city || user.city.city,
                    state: state || user.city.state
                }
            });
            updateData.cityId = createdLocation.id;
        }
    }

    // Perform the update
    await client.user.update({
        where: { id: userId },
        data: updateData
    });

    res.json({
        message: "Your profile details updated"
    });
};

/**
    method : PUT
    route : /api/v1/user/reset-password
    description : to reset user's password
*/

const resetUserPassword = async (req, res) => {
    const requireBody = z.object({
        oldPassword : z.string().min(3).max(100),
        newPassword : z.string().min(3).max(100)
    });
       
    
    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        res.json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        })
        return;
    }
    
    const { userId } = req.user;
    const user = await client.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        return res.status(400).json({
            message: "Invalid user"
        });
    }

    const { oldPassword, newPassword } = req.body;

    if (await bcrypt.compare(oldPassword, user.password) === false) {
        return res.status(400).json({
            message: "Invalid password"
        });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await client.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    res.json({
        message: "Your password updated"
    });
};

/**
    method : GET
    route : /api/v1/user/trains
    description : get list of all trains with their routes and schedules
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
                }
            }
        });

        const formattedTrains = trains.map(train => ({
            id: train.id,
            name: train.trainName,
            status: train.status,
            routes: train.routes.map(route => ({
                stopNo: route.stopNo,
                stationName: route.station.name,
                city: route.station.city.city,
                arrival: route.arrival,
                departure: route.departure
            }))
        }));

        res.json({
            message: "Trains retrieved successfully",
            trains: formattedTrains
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving trains",
            error: error.message
        });
    }
};

/**
    method : GET
    route : /api/v1/user/trains/:trainId
    description : get detailed information about a specific train including routes, coaches, and seats
*/
const getTrainDetails = async (req, res) => {
    try {
        const trainId = parseInt(req.params.trainId);
        const train = await client.train.findUnique({
            where: { id: trainId },
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
                        seats: {
                            orderBy: {
                                seatNo: 'asc'
                            }
                        }
                    }
                },
                schedules: {
                    include: {
                        station: true
                    }
                }
            }
        });

        if (!train) {
            return res.status(404).json({
                message: "Train not found"
            });
        }

        res.json({
            message: "Train details retrieved successfully",
            train: {
                id: train.id,
                name: train.trainName,
                status: train.status,
                routes: train.routes.map(route => ({
                    stopNo: route.stopNo,
                    stationName: route.station.name,
                    city: route.station.city.city,
                    arrival: route.arrival,
                    departure: route.departure
                })),
                coaches: train.coaches.map(coach => ({
                    id: coach.id,
                    totalSeats: coach.noOfSeats,
                    availableSeats: coach.seats.filter(seat => seat.status === 'available').length,
                    seats: coach.seats
                })),
                schedules: train.schedules
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving train details",
            error: error.message
        });
    }
};

/**
    method : GET
    route : /api/v1/user/stations
    description : get list of all train stations with their city and state information
*/
const getAllStations = async (req, res) => {
    try {
        const stations = await client.station.findMany({
            include: {
                city: true
            }
        });

        const formattedStations = stations.map(station => ({
            id: station.id,
            name: station.name,
            city: station.city.city,
            state: station.city.state
        }));

        res.json({
            message: "Stations retrieved successfully",
            stations: formattedStations
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving stations",
            error: error.message
        });
    }
};

/**
    method : GET
    route : /api/v1/user/stations/:trainId
    description : get list of all stations for a specific train with schedule information
*/
const getTrainStations = async (req, res) => {
    try {
        const trainId = parseInt(req.params.trainId);
        const trainRoutes = await client.trainRoute.findMany({
            where: { trainId },
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
        });

        if (!trainRoutes.length) {
            return res.status(404).json({
                message: "No stations found for this train"
            });
        }

        const formattedStations = trainRoutes.map(route => ({
            stopNo: route.stopNo,
            stationId: route.station.id,
            name: route.station.name,
            city: route.station.city.city,
            state: route.station.city.state,
            arrival: route.arrival,
            departure: route.departure
        }));

        res.json({
            message: "Train stations retrieved successfully",
            stations: formattedStations
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving train stations",
            error: error.message
        });
    }
};

/**
    method : POST
    route : /api/v1/user/tickets/book
    description : book a train ticket with passenger details and seat selection
*/
const bookTicket = async (req, res) => {
    const requireBody = z.object({
        trainId: z.number().int(),
        coachId: z.number().int(),
        seatId: z.number().int(),
        tripId: z.number().int(),
        passengerDetails: z.object({
            name: z.string(),
            age: z.number().int().min(1).max(120),
            gender: z.enum(["male", "female", "other"])
        })
    });

    try {
        const parseDataWithSuccess = requireBody.safeParse(req.body);
        if (!parseDataWithSuccess.success) {
            return res.status(400).json({
                message: "Incorrect format",
                error: parseDataWithSuccess.error.format()
            });
        }

        const { trainId, coachId, seatId, tripId, passengerDetails } = req.body;
        const { userId } = req.user;

        // Start transaction
        const result = await client.$transaction(async (prisma) => {
            // Check if seat is available
            const seat = await prisma.seat.findUnique({
                where: { id: seatId }
            });

            if (!seat || seat.status !== 'available') {
                throw new Error('Seat not available');
            }

            // Create or get passenger
            let passenger = await prisma.passenger.create({
                data: {
                    name: passengerDetails.name,
                    age: passengerDetails.age,
                    gender: passengerDetails.gender,
                    userId
                }
            });

            // Calculate price (example: base price + distance)
            const trip = await prisma.trip.findUnique({
                where: { id: tripId }
            });
            
            if (!trip) {
                throw new Error('Invalid trip ID');
            }
            
            const price = trip.distance * 1.5; // Example pricing logic

            // Generate PNR (8-digit number to fit within INT4)
            const pnr = Math.floor(10000000 + Math.random() * 90000000);

            // Create ticket
            const ticket = await prisma.ticket.create({
                data: {
                    pnr,
                    coachId,
                    price,
                    date: new Date(),
                    tripId,
                    passengerId: passenger.id
                }
            });

            // Update seat status
            await prisma.seat.update({
                where: { id: seatId },
                data: { status: 'booked' }
            });

            // Create payment record
            const payment = await prisma.payment.create({
                data: {
                    ticketId: ticket.pnr,
                    amount: price,
                    status: 'pending'
                }
            });

            return { ticket, payment, passenger };
        });

        res.status(201).json({
            message: "Ticket booked successfully",
            booking: {
                pnr: result.ticket.pnr,
                price: result.ticket.price,
                paymentId: result.payment.id
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error booking ticket",
            error: error.message
        });
    }
};

/**
    method : GET
    route : /api/v1/user/tickets/:ticketId
    description : get details of a specific ticket including passenger, journey, and payment information
*/
const getTicketDetails = async (req, res) => {
    try {
        const pnr = parseInt(req.params.ticketId);
        const ticket = await client.ticket.findUnique({
            where: { pnr },
            include: {
                coach: true,
                trip: {
                    include: {
                        train: true,
                        boardingSt: {
                            include: { city: true }
                        },
                        destination: {
                            include: { city: true }
                        }
                    }
                },
                passenger: true,
                payment: true
            }
        });

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        // Check if ticket belongs to user
        if (ticket.passenger.userId !== req.user.userId) {
            return res.status(403).json({
                message: "Not authorized to view this ticket"
            });
        }

        res.json({
            message: "Ticket details retrieved successfully",
            ticket: {
                pnr: ticket.pnr,
                passenger: {
                    name: ticket.passenger.name,
                    age: ticket.passenger.age,
                    gender: ticket.passenger.gender
                },
                journey: {
                    train: ticket.trip.train.trainName,
                    from: {
                        station: ticket.trip.boardingSt.name,
                        city: ticket.trip.boardingSt.city.city
                    },
                    to: {
                        station: ticket.trip.destination.name,
                        city: ticket.trip.destination.city.city
                    },
                    date: ticket.date
                },
                seat: {
                    coach: ticket.coach.id,
                    seatNo: ticket.seatNo
                },
                payment: {
                    amount: ticket.price,
                    status: ticket.payment.status
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving ticket details",
            error: error.message
        });
    }
};

/**
    method : GET
    route : /api/v1/user/tickets
    description : get list of all tickets booked by the user
*/
const getUserTickets = async (req, res) => {
    try {
        const { userId } = req.user;
        const tickets = await client.ticket.findMany({
            where: {
                passenger: {
                    userId
                }
            },
            include: {
                coach: true,
                trip: {
                    include: {
                        train: true,
                        boardingSt: {
                            include: { city: true }
                        },
                        destination: {
                            include: { city: true }
                        }
                    }
                },
                passenger: true,
                payment: true
            },
            orderBy: {
                date: 'desc'
            }
        });

        const formattedTickets = tickets.map(ticket => ({
            pnr: ticket.pnr,
            passenger: {
                name: ticket.passenger.name,
                age: ticket.passenger.age,
                gender: ticket.passenger.gender
            },
            journey: {
                train: ticket.trip.train.trainName,
                from: ticket.trip.boardingSt.name,
                to: ticket.trip.destination.name,
                date: ticket.date
            },
            payment: {
                amount: ticket.price,
                status: ticket.payment.status
            }
        }));

        res.json({
            message: "Tickets retrieved successfully",
            tickets: formattedTickets
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving tickets",
            error: error.message
        });
    }
};

/**
    method : DELETE
    route : /api/v1/user/tickets/:ticketId
    description : cancel a ticket and initiate refund if applicable
*/
const cancelTicket = async (req, res) => {
    try {
        const pnr = parseInt(req.params.ticketId);
        const ticket = await client.ticket.findUnique({
            where: { pnr },
            include: {
                passenger: true,
                payment: true
            }
        });

        if (!ticket) {
            return res.status(404).json({
                message: "Ticket not found"
            });
        }

        // Check if ticket belongs to user
        if (ticket.passenger.userId !== req.user.userId) {
            return res.status(403).json({
                message: "Not authorized to cancel this ticket"
            });
        }

        // Check if ticket is already cancelled or journey completed
        if (new Date(ticket.date) < new Date()) {
            return res.status(400).json({
                message: "Cannot cancel ticket after journey date"
            });
        }

        await client.$transaction(async (prisma) => {
            // Update seat status back to available
            await prisma.seat.update({
                where: { 
                    coachId_seatNo: {
                        coachId: ticket.coachId,
                        seatNo: ticket.seatNo
                    }
                },
                data: { status: 'available' }
            });

            // Update payment status
            await prisma.payment.update({
                where: { ticketId: pnr },
                data: { status: 'cancelled' }
            });

            // Create refund transaction if payment was completed
            if (ticket.payment.status === 'completed') {
                await prisma.transaction.create({
                    data: {
                        paymentId: ticket.payment.id,
                        transactionId: `REF-${Date.now()}`,
                        type: 'refund'
                    }
                });
            }

            // Delete the ticket
            await prisma.ticket.delete({
                where: { pnr }
            });
        });

        res.json({
            message: "Ticket cancelled successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error cancelling ticket",
            error: error.message
        });
    }
};

/**
    method : POST
    route : /api/v1/user/payment/checkout
    description : initiate payment for a ticket booking
*/
const initiatePayment = async (req, res) => {
    const requireBody = z.object({
        ticketId: z.number().int(),
        paymentMethod: z.enum(["card", "upi", "netbanking"])
    });

    try {
        const parseDataWithSuccess = requireBody.safeParse(req.body);
        if (!parseDataWithSuccess.success) {
            return res.status(400).json({
                message: "Incorrect format",
                error: parseDataWithSuccess.error.format()
            });
        }

        const { ticketId, paymentMethod } = req.body;
        const { userId } = req.user;

        const ticket = await client.ticket.findUnique({
            where: { pnr: ticketId },
            include: {
                passenger: true,
                payment: true
            }
        });

        if (!ticket || ticket.passenger.userId !== userId) {
            return res.status(404).json({
                message: "Ticket not found or unauthorized"
            });
        }

        if (ticket.payment.status !== 'pending') {
            return res.status(400).json({
                message: "Payment already processed"
            });
        }

        // Here you would integrate with your payment gateway
        // This is a placeholder for the actual payment processing
        const paymentResponse = {
            success: true,
            transactionId: `TXN-${Date.now()}`
        };

        if (paymentResponse.success) {
            await client.$transaction(async (prisma) => {
                await prisma.payment.update({
                    where: { id: ticket.payment.id },
                    data: { status: 'completed' }
                });

                await prisma.transaction.create({
                    data: {
                        paymentId: ticket.payment.id,
                        transactionId: paymentResponse.transactionId
                    }
                });
            });
        }

        res.json({
            message: "Payment initiated successfully",
            transactionId: paymentResponse.transactionId
        });
    } catch (error) {
        res.status(500).json({
            message: "Error processing payment",
            error: error.message
        });
    }
};

/**
    method : GET
    route : /api/v1/user/payment/:paymentId/status
    description : check the status of a payment
*/
const getPaymentStatus = async (req, res) => {
    try {
        const paymentId = parseInt(req.params.paymentId);
        const payment = await client.payment.findUnique({
            where: { id: paymentId },
            include: {
                ticket: {
                    include: {
                        passenger: true
                    }
                },
                transaction: true
            }
        });

        if (!payment || payment.ticket.passenger.userId !== req.user.userId) {
            return res.status(404).json({
                message: "Payment not found or unauthorized"
            });
        }

        res.json({
            message: "Payment status retrieved successfully",
            payment: {
                id: payment.id,
                amount: payment.amount,
                status: payment.status,
                date: payment.paymentDate,
                transaction: payment.transaction ? {
                    id: payment.transaction.transactionId,
                    timestamp: payment.transaction.timestamp
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving payment status",
            error: error.message
        });
    }
};

module.exports = {
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
};
