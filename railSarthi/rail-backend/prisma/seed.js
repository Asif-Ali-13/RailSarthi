const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    // Clean up existing data
    await prisma.transaction.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.passenger.deleteMany({});
    await prisma.seat.deleteMany({});
    await prisma.coach.deleteMany({});
    await prisma.trip.deleteMany({});
    await prisma.schedule.deleteMany({});
    await prisma.trainRoute.deleteMany({});
    await prisma.shift.deleteMany({});
    await prisma.train.deleteMany({});
    await prisma.station.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.admin.deleteMany({});
    await prisma.location.deleteMany({});

    // Create Locations (4 major Indian cities)
    console.log('Creating locations...');
    const locations = await Promise.all([
        prisma.location.create({
            data: { city: 'New Delhi', state: 'Delhi' }
        }),
        prisma.location.create({
            data: { city: 'Mumbai', state: 'Maharashtra' }
        }),
        prisma.location.create({
            data: { city: 'Kolkata', state: 'West Bengal' }
        }),
        prisma.location.create({
            data: { city: 'Chennai', state: 'Tamil Nadu' }
        })
    ]);

    // Create Admin
    console.log('Creating admin...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.admin.create({
        data: {
            firstName: 'Rajesh',
            lastName: 'Kumar',
            email: 'admin@indianrail.com',
            password: adminPassword,
            cityId: locations[0].id, // Delhi
            age: 45,
            gender: 'male',
            createdByAdmin: 0
        }
    });

    // Create Users (3)
    console.log('Creating users...');
    const userPassword = await bcrypt.hash('user123', 10);
    const users = await Promise.all([
        prisma.user.create({
            data: {
                firstName: 'Amit',
                lastName: 'Sharma',
                email: 'amit@example.com',
                password: userPassword,
                cityId: locations[0].id, // Delhi
                age: 32,
                gender: 'male'
            }
        }),
        prisma.user.create({
            data: {
                firstName: 'Priya',
                lastName: 'Patel',
                email: 'priya@example.com',
                password: userPassword,
                cityId: locations[1].id, // Mumbai
                age: 28,
                gender: 'female'
            }
        }),
        prisma.user.create({
            data: {
                firstName: 'Suresh',
                lastName: 'Reddy',
                email: 'suresh@example.com',
                password: userPassword,
                cityId: locations[3].id, // Chennai
                age: 35,
                gender: 'male'
            }
        })
    ]);

    // Create Employees (4)
    console.log('Creating employees...');
    const employeePassword = await bcrypt.hash('emp123', 10);
    const employees = await Promise.all([
        prisma.employee.create({
            data: {
                firstName: 'Vikram',
                lastName: 'Singh',
                email: 'manager@indianrail.com',
                password: employeePassword,
                cityId: locations[0].id, // Delhi
                age: 48,
                gender: 'male',
                role: 'manager'
            }
        }),
        prisma.employee.create({
            data: {
                firstName: 'Deepak',
                lastName: 'Verma',
                email: 'station@indianrail.com',
                password: employeePassword,
                cityId: locations[1].id, // Mumbai
                age: 42,
                gender: 'male',
                role: 'station_manager'
            }
        }),
        prisma.employee.create({
            data: {
                firstName: 'Anjali',
                lastName: 'Gupta',
                email: 'booking@indianrail.com',
                password: employeePassword,
                cityId: locations[2].id, // Kolkata
                age: 35,
                gender: 'female',
                role: 'booking_clerk'
            }
        }),
        prisma.employee.create({
            data: {
                firstName: 'Ramesh',
                lastName: 'Kumar',
                email: 'pilot@indianrail.com',
                password: employeePassword,
                cityId: locations[3].id, // Chennai
                age: 45,
                gender: 'male',
                role: 'loco_pilot'
            }
        })
    ]);

    // Create Stations (4 major railway stations)
    console.log('Creating stations...');
    const stations = await Promise.all([
        prisma.station.create({
            data: {
                name: 'New Delhi Railway Station',
                cityId: locations[0].id
            }
        }),
        prisma.station.create({
            data: {
                name: 'Chhatrapati Shivaji Terminus',
                cityId: locations[1].id
            }
        }),
        prisma.station.create({
            data: {
                name: 'Howrah Junction',
                cityId: locations[2].id
            }
        }),
        prisma.station.create({
            data: {
                name: 'Chennai Central',
                cityId: locations[3].id
            }
        })
    ]);

    // Create Trains (3 popular Indian trains)
    console.log('Creating trains...');
    const trains = await Promise.all([
        prisma.train.create({
            data: {
                trainName: 'Rajdhani Express',
                sourceStId: stations[0].id, // Delhi
                destStId: stations[1].id,   // Mumbai
                noOfCoaches: 18,
                noOfSeats: 1080,           // 60 seats per coach
                locoPilotId: employees[3].id,
                status: 'on_time'
            }
        }),
        prisma.train.create({
            data: {
                trainName: 'Duronto Express',
                sourceStId: stations[1].id, // Mumbai
                destStId: stations[2].id,   // Kolkata
                noOfCoaches: 16,
                noOfSeats: 960,
                locoPilotId: employees[3].id,
                status: 'on_time'
            }
        }),
        prisma.train.create({
            data: {
                trainName: 'Shatabdi Express',
                sourceStId: stations[2].id, // Kolkata
                destStId: stations[3].id,   // Chennai
                noOfCoaches: 14,
                noOfSeats: 840,
                locoPilotId: employees[3].id,
                status: 'on_time'
            }
        })
    ]);

    // Create Train Routes with realistic timings
    console.log('Creating train routes...');
    const now = new Date();
    const trainRoutes = await Promise.all([
        // Rajdhani Express (Delhi to Mumbai - typically 16 hours journey)
        prisma.trainRoute.create({
            data: {
                trainId: trains[0].id,
                stationId: stations[0].id,
                stopNo: 1,
                departure: new Date(now.getTime() + 16 * 60 * 60 * 1000) // 4:00 PM departure
            }
        }),
        prisma.trainRoute.create({
            data: {
                trainId: trains[0].id,
                stationId: stations[1].id,
                stopNo: 2,
                arrival: new Date(now.getTime() + 32 * 60 * 60 * 1000) // 8:00 AM arrival next day
            }
        }),
        
        // Duronto Express (Mumbai to Kolkata - typically 24 hours journey)
        prisma.trainRoute.create({
            data: {
                trainId: trains[1].id,
                stationId: stations[1].id,
                stopNo: 1,
                departure: new Date(now.getTime() + 20 * 60 * 60 * 1000) // 8:00 PM departure
            }
        }),
        prisma.trainRoute.create({
            data: {
                trainId: trains[1].id,
                stationId: stations[2].id,
                stopNo: 2,
                arrival: new Date(now.getTime() + 44 * 60 * 60 * 1000) // 8:00 PM arrival next day
            }
        })
    ]);

    // Create Schedules (4)
    console.log('Creating schedules...');
    const schedules = await Promise.all([
        prisma.schedule.create({
            data: {
                trainId: trains[0].id,
                stationId: stations[0].id,
                date: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
                arrDept: 'D'
            }
        }),
        prisma.schedule.create({
            data: {
                trainId: trains[0].id,
                stationId: stations[1].id,
                date: new Date(now.getTime() + 40 * 60 * 60 * 1000), // Tomorrow + 16 hours
                arrDept: 'A'
            }
        }),
        prisma.schedule.create({
            data: {
                trainId: trains[1].id,
                stationId: stations[1].id,
                date: new Date(now.getTime() + 26 * 60 * 60 * 1000), // Tomorrow + 2 hours
                arrDept: 'D'
            }
        }),
        prisma.schedule.create({
            data: {
                trainId: trains[1].id,
                stationId: stations[2].id,
                date: new Date(now.getTime() + 32 * 60 * 60 * 1000), // Tomorrow + 8 hours
                arrDept: 'A'
            }
        })
    ]);

    // Create Shifts (4)
    console.log('Creating shifts...');
    const shifts = await Promise.all([
        // Manager shift
        prisma.shift.create({
            data: {
                employeeId: employees[0].id,
                stationId: stations[0].id,
                shiftNo: 1
            }
        }),
        // Station Manager shift
        prisma.shift.create({
            data: {
                employeeId: employees[1].id,
                stationId: stations[1].id,
                shiftNo: 1
            }
        }),
        // Booking Clerk shift
        prisma.shift.create({
            data: {
                employeeId: employees[2].id,
                stationId: stations[2].id,
                shiftNo: 1
            }
        }),
        // Loco Pilot shift
        prisma.shift.create({
            data: {
                employeeId: employees[3].id,
                trainId: trains[0].id,
                shiftNo: 1
            }
        })
    ]);

    // Create Trips (3)
    console.log('Creating trips...');
    const trips = await Promise.all([
        prisma.trip.create({
            data: {
                boardingStId: stations[0].id,
                destId: stations[1].id,
                trainId: trains[0].id,
                distance: 1400
            }
        }),
        prisma.trip.create({
            data: {
                boardingStId: stations[1].id,
                destId: stations[2].id,
                trainId: trains[1].id,
                distance: 2100
            }
        }),
        prisma.trip.create({
            data: {
                boardingStId: stations[2].id,
                destId: stations[3].id,
                trainId: trains[2].id,
                distance: 1800
            }
        })
    ]);

    // Create Coaches (3)
    console.log('Creating coaches...');
    const coaches = await Promise.all([
        prisma.coach.create({
            data: {
                trainId: trains[0].id,
                noOfSeats: 72
            }
        }),
        prisma.coach.create({
            data: {
                trainId: trains[1].id,
                noOfSeats: 72
            }
        }),
        prisma.coach.create({
            data: {
                trainId: trains[2].id,
                noOfSeats: 72
            }
        })
    ]);

    // Create Seats (3-4 per coach)
    console.log('Creating seats...');
    const seatTypes = ['SL', 'SU', 'L', 'M', 'U'];
    
    // Create just 4 seats for each coach (for demonstration)
    for (const coach of coaches) {
        const seatsToCreate = [];
        for (let seatNo = 1; seatNo <= 4; seatNo++) {
            seatsToCreate.push({
                coachId: coach.id,
                seatNo,
                seatType: seatTypes[Math.floor(Math.random() * seatTypes.length)],
                status: 'available'
            });
        }
        await prisma.seat.createMany({
            data: seatsToCreate
        });
    }

    // Create Passengers (3)
    console.log('Creating passengers...');
    const passengers = await Promise.all([
        prisma.passenger.create({
            data: {
                name: 'Rahul Malhotra',    // New unique name
                age: 32,
                gender: 'male',
                userId: users[0].id
            }
        }),
        prisma.passenger.create({
            data: {
                name: 'Meera Iyer',        // New unique name
                age: 28,
                gender: 'female',
                userId: users[1].id
            }
        }),
        prisma.passenger.create({
            data: {
                name: 'Karthik Menon',     // New unique name
                age: 35,
                gender: 'male',
                userId: users[2].id
            }
        })
    ]);

    // Create Tickets (3)
    console.log('Creating tickets...');
    const tickets = await Promise.all([
        prisma.ticket.create({
            data: {
                pnr: 1234567890,
                coachId: coaches[0].id,
                price: 1500.00,
                date: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
                tripId: trips[0].id,
                passengerId: passengers[0].id
            }
        }),
        prisma.ticket.create({
            data: {
                pnr: 1234567891,
                coachId: coaches[1].id,
                price: 2100.00,
                date: new Date(now.getTime() + 26 * 60 * 60 * 1000), // Tomorrow + 2 hours
                tripId: trips[1].id,
                passengerId: passengers[1].id
            }
        }),
        prisma.ticket.create({
            data: {
                pnr: 1234567892,
                coachId: coaches[2].id,
                price: 1800.00,
                date: new Date(now.getTime() + 28 * 60 * 60 * 1000), // Tomorrow + 4 hours
                tripId: trips[2].id,
                passengerId: passengers[2].id
            }
        })
    ]);

    // Create Payments (3)
    console.log('Creating payments...');
    const payments = await Promise.all([
        prisma.payment.create({
            data: {
                ticketId: tickets[0].pnr,
                amount: 1500.00,
                paymentDate: new Date(),
                status: 'completed'
            }
        }),
        prisma.payment.create({
            data: {
                ticketId: tickets[1].pnr,
                amount: 2100.00,
                paymentDate: new Date(),
                status: 'completed'
            }
        }),
        prisma.payment.create({
            data: {
                ticketId: tickets[2].pnr,
                amount: 1800.00,
                paymentDate: new Date(),
                status: 'completed'
            }
        })
    ]);

    // Create Transactions (3)
    console.log('Creating transactions...');
    const transactions = await Promise.all([
        prisma.transaction.create({
            data: {
                paymentId: payments[0].id,
                transactionId: 'TXN' + Math.floor(Math.random() * 1000000000),
                timestamp: new Date()
            }
        }),
        prisma.transaction.create({
            data: {
                paymentId: payments[1].id,
                transactionId: 'TXN' + Math.floor(Math.random() * 1000000000),
                timestamp: new Date()
            }
        }),
        prisma.transaction.create({
            data: {
                paymentId: payments[2].id,
                transactionId: 'TXN' + Math.floor(Math.random() * 1000000000),
                timestamp: new Date()
            }
        })
    ]);

    console.log('Seed data created successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
