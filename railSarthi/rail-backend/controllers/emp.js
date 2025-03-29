const { PrismaClient } = require("@prisma/client");
const client = new PrismaClient();

const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isManager } = require("../utils/manager");
const { isStationManager } = require("../utils/stationManager");

/**
    method : POST
    route : /api/v1/emp/signin
    description : employee login
    role : all employees
*/

const empSignIn = async (req, res) => {
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
    const emp = await client.employee.findUnique({
        where: { email }
    });

    if (!emp) {
        return res.status(400).json({
            message: "Invalid email"
        });
    }

    const isPasswordCorrect = await bcrypt.compare(password, emp.password);

    if (!isPasswordCorrect) {
        return res.status(400).json({
            message: "Invalid password"
        });
    }

    const token = jwt.sign({ empId: emp.id }, process.env.JWT_EMP_SECRET);

    res.json({
        message: "You are signed in",
        token
    });
};

/**
    method : GET
    route : /api/v1/emp/profile
    description : to get employee profile
    role : all employees
*/

const empProfile = async (req, res) => {
    const { empId } = req.emp;
    const emp = await client.employee.findUnique({
        where: { id: empId },
        include: {
            city: true // Include the Location data
        }
    });

    if (!emp) {
        return res.status(400).json({
            message: "Invalid user"
        });
    }

    const profile = {
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        city: emp.city.city, // Get city from Location relation
        state: emp.city.state, // Get state from Location relation
        gender: emp.gender,
        age: emp.age,
        role: emp.role
    }

    res.json({
        message: "Your Profile details",
        profile
    });
};

/**
    method : PUT
    route : /api/v1/emp/update-profile
    description : to update employee's profile
    role : all employees
*/

const updateEmpProfile = async (req, res) => {
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
    
    const { empId } = req.emp;
    const emp = await client.employee.findUnique({
        where: { id: empId },
        include: {
            city: true // Include the Location data
        }
    });

    if (!emp) {
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
    if (email) updateData.email = email;

    // Handle city and state update
    if (city || state) {
        // Search for existing location with new city/state combination
        const newLocation = await client.location.findFirst({
            where: {
                AND: [
                    { 
                        city: { 
                            equals: city || emp.city.city, 
                            mode: 'insensitive' 
                        }
                    },
                    { 
                        state: { 
                            equals: state || emp.city.state, 
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
                    city: city || emp.city.city,
                    state: state || emp.city.state
                }
            });
            updateData.cityId = createdLocation.id;
        }
    }

    // Perform the update
    await client.employee.update({
        where: { id: empId },
        data: updateData
    });

    res.json({
        message: "Your profile details updated"
    });
};

/**
    method : PUT
    route : /api/v1/emp/reset-password
    description : to reset employee's password
    role : all employees
*/

const resetEmpPassword = async (req, res) => {
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
    
    const { empId } = req.emp;
    const emp = await client.employee.findUnique({
        where: { id: empId }
    });

    if (!emp) {
        return res.status(400).json({
            message: "Invalid user"
        });
    }

    const { oldPassword, newPassword } = req.body;

    if (await bcrypt.compare(oldPassword, emp.password) === false) {
        return res.status(400).json({
            message: "Invalid password"
        });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await client.employee.update({
        where: { id: empId },
        data: { password: hashedPassword }
    });

    res.json({
        message: "Your password updated"
    });
};

/**
    method : GET
    route : /api/v1/emp/m/employees
    description : to get all employees
    role : manager
*/

const managerGetEmployeesInfo = async (req, res) => {
    const { empId } = req.emp;
    if(!await isManager(empId)){
        return res.status(400).json({
            message: "not authorized"
        });
    }

    const emps = await client.employee.findMany({
        include: {
            city: true // Include location data
        }
    });

    // Format employee data to include city and state
    const formattedEmps = emps.map(emp => ({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        city: emp.city.city,
        state: emp.city.state,
        gender: emp.gender,
        age: emp.age,
        role: emp.role
    }));

    res.json({
        message: "All employees",
        employees: formattedEmps
    });
};

/**
    method : POST
    route : /api/v1/emp/m/addEmployee
    description : to add a new employee
    role : manager
*/

const managerAddEmployee = async (req, res) => {
    if (!await isManager(req.emp.empId)) {
        return res.status(400).json({
            message: "You are not authorized to add employee"
        });
    }

    const requireBody = z.object({
        firstName: z.string().min(3).max(30),
        lastName: z.string().min(3).max(30),
        email: z.string().min(3).max(100).email(),
        city: z.string().min(3).max(50),
        state: z.string().min(3).max(50),
        gender: z.enum(["male", "female", "other"]),
        age: z.number().int().max(120),
        role: z.enum(["manager", "station_manager", "booking_clerk", "loco_pilot"])
    });

    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        });
    }
    
    const { firstName, lastName, email, city, state, gender, age, role } = req.body;
    const hashedPassword = await bcrypt.hash(`railsarthi.${email}`, 10);
    
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

    await client.employee.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            cityId: location.id, // Use location ID
            gender,
            age,
            role
        }
    });

    res.json({
        message: "New employee added"
    });
};

/**
    method : GET
    route : /api/v1/emp/m/employees/:empId
    description : to get the details of a specific employee
    role : manager
*/

const managerGetEmployeeDetails = async (req, res) => {
    if (!await isManager(req.emp.empId)) {
        return res.status(400).json({
            message: "You are not authorized to view employee details"
        });
    }

    const empId = req.params.empId;
    const emp = await client.employee.findUnique({
        where: { id: parseInt(empId) },
        include: {
            city: true, // Include location data
            shifts: {
                include: {
                    station: true,
                    train: true
                }
            }
        }
    });

    if (!emp) {
        return res.status(400).json({
            message: "Invalid user"
        });
    }

    // Format employee data
    const formattedEmp = {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        city: emp.city.city,
        state: emp.city.state,
        gender: emp.gender,
        age: emp.age,
        role: emp.role,
        shifts: emp.shifts.map(shift => ({
            id: shift.id,
            shiftNo: shift.shiftNo,
            station: shift.station ? {
                id: shift.station.id,
                name: shift.station.name
            } : null,
            train: shift.train ? {
                id: shift.train.id,
                name: shift.train.trainName
            } : null
        }))
    };

    res.json({
        message: "Employee details",
        employee: formattedEmp
    });
};

/**
    method : PUT
    route : /api/v1/emp/m/employees/:empId/update-role
    description : manager can update the role of a specific employee
    role : manager
*/

const managerUpdateEmployeeRole = async (req, res) => {
    if (!await isManager(req.emp.empId)) {
        return res.status(400).json({
            message: "You are not authorized to update employee role"
        });
    }

    const requireBody = z.object({
        role: z.enum(["manager", "station_manager", "booking_clerk", "loco_pilot"])
    });
       
    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        });
    }
    
    const { empId } = req.params;
    const emp = await client.employee.findUnique({
        where: { id: parseInt(empId) }
    });

    if(!emp){
        return res.status(400).json({
            message: "Invalid user"
        });
    }

    await client.employee.update({
        where: { id: parseInt(empId) },
        data: { role: req.body.role }
    });

    res.json({
        message: "Employee role updated"
    });
};

/**
    method : DELETE
    route : /api/v1/emp/m/employees/:empId
    description : manager can remove a specific employee
    role : manager
*/

const managerRemoveEmployee = async (req, res) => {
    if (!await isManager(req.emp.empId)) {
        return res.status(400).json({
            message: "You are not authorized to remove any employee"
        });
    }

    const { empId } = req.params;
    const emp = await client.employee.findUnique({
        where: { id: parseInt(empId) }
    }); 

    if (!emp) {
        return res.status(400).json({
            message: "Invalid user"
        });
    }

    // Delete related shifts first to avoid foreign key constraints
    await client.shift.deleteMany({
        where: { employeeId: parseInt(empId) }
    });

    await client.employee.delete({
        where: { id: parseInt(empId) }
    });

    res.json({
        message: "Employee removed"
    });
};

/**
    method : GET
    route : /api/v1/emp/sm/trains
    description : station manager can get the schedule of all trains of his station
    role : station manager
*/

const stationManagerGetTrains = async (req, res) => {
    const stId = await isStationManager(req.emp.empId);

    if (!stId) {
        return res.status(400).json({
            message: "You are not authorized to view trains"
        });
    }

    const schedules = await client.schedule.findMany({
        where: { stationId: stId },
        include: {
            train: true,
            station: {
                include: {
                    city: true
                }
            }
        }
    });

    // Format schedule data
    const formattedSchedules = schedules.map(schedule => ({
        id: schedule.id,
        trainId: schedule.trainId,
        trainName: schedule.train.trainName,
        stationId: schedule.stationId,
        stationName: schedule.station.name,
        stationCity: schedule.station.city.city,
        date: schedule.date,
        arrDept: schedule.arrDept
    }));

    res.json({
        message: "Train schedules",
        schedules: formattedSchedules
    });
};

/**
    method : GET
    route : /api/v1/emp/sm/trains/:trainId
    description : station manager can get the schedule of a specific train of his station
    role : station manager
*/

const stationManagerGetTrainDetails = async (req, res) => {
    const stId = await isStationManager(req.emp.empId);

    if (!stId) {
        return res.status(400).json({
            message: "You are not authorized to view trains"
        });
    }

    const trainId = parseInt(req.params.trainId);
    const requireBody = z.object({
        date: z.string()
    });
    
    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        });
    }
    
    const { date } = req.body;
    if(isNaN(new Date(date).getTime())) {
        return res.status(400).json({ message: "Invalid date" });
    }

    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    const schedules = await client.schedule.findMany({
        where: {
            AND: [
                { stationId: stId },
                { trainId: trainId },
                {
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            ]
        },
        include: {
            train: true,
            station: {
                include: {
                    city: true
                }
            }
        }
    });

    if (schedules.length === 0) {
        return res.status(404).json({
            message: "No schedules found for this train on the specified date"
        });
    }

    // Format schedule data
    const formattedSchedules = schedules.map(schedule => ({
        id: schedule.id,
        trainId: schedule.trainId,
        trainName: schedule.train.trainName,
        stationId: schedule.stationId,
        stationName: schedule.station.name,
        stationCity: schedule.station.city.city,
        date: schedule.date,
        arrDept: schedule.arrDept
    }));

    res.json({
        message: "Train schedules",
        schedules: formattedSchedules
    });
};

/**
    method : POST
    route : /api/v1/emp/sm/schedule
    description : station manager can get add a new schedule of a train for his station
    role : station manager
*/

const stationManagerAddSchedule = async (req, res) => {
    const stId = await isStationManager(req.emp.empId);

    if (!stId) {
        return res.status(400).json({
            message: "You are not authorized to add schedules"
        });
    }

    const requireBody = z.object({
        trainId: z.number().int(),
        date: z.string(),
        time: z.string(),
        arrDept: z.enum(["A", "D"])
    });
    
    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        });
    }

    const { trainId, date, time, arrDept } = req.body;

    // Validate date and time
    const dateTimeString = `${date}T${time}:00Z`;
    const scheduleDateTime = new Date(dateTimeString);
    
    if(isNaN(scheduleDateTime.getTime())) {
        return res.status(400).json({ message: "Invalid date or time format" });
    }

    // Check if train exists
    const train = await client.train.findUnique({
        where: { id: trainId }
    });

    if (!train) {
        return res.status(404).json({
            message: "Train not found"
        });
    }

    // Check if station exists
    const station = await client.station.findUnique({
        where: { id: stId }
    });

    if (!station) {
        return res.status(404).json({
            message: "Station not found"
        });
    }

    // Check if schedule already exists
    const existingSchedule = await client.schedule.findFirst({
        where: {
            trainId,
            stationId: stId,
            date: scheduleDateTime,
            arrDept
        }
    });

    if (existingSchedule) {
        return res.status(400).json({
            message: "Schedule already exists for this train, station, date and arrival/departure type"
        });
    }

    // Create new schedule
    const newSchedule = await client.schedule.create({
        data: {
            trainId,
            stationId: stId,
            date: scheduleDateTime,
            arrDept
        }
    });

    res.status(201).json({
        message: "Schedule added successfully",
        schedule: newSchedule
    });
};

/**
    method : PUT
    route : /api/v1/emp/sm/schedule/:id
    description : station manager can update the schedule of a specific train of his station
    role : station manager
*/

const stationManagerUpdateSchedule = async (req, res) => {
    const stId = await isStationManager(req.emp.empId);
    
    if(!stId) {
        return res.status(401).json({ message: "You are not a station manager" });
    }
    
    const scheduleId = parseInt(req.params.id);
    
    // Check if schedule exists and belongs to this station
    const existingSchedule = await client.schedule.findFirst({
        where: {
            id: scheduleId,
            stationId: stId
        }
    });
    
    if (!existingSchedule) {
        return res.status(404).json({
            message: "Schedule not found or you don't have permission to update it"
        });
    }

    const requireBody = z.object({
        date: z.string().optional(),
        time: z.string().optional(),
        arrDept: z.enum(["A", "D"]).optional()
    });

    const parseDataWithSuccess = requireBody.safeParse(req.body);
    if(!parseDataWithSuccess.success){
        return res.status(400).json({
            message: "Incorrect format",
            error: parseDataWithSuccess.error.format()
        });
    }

    const { date, time, arrDept } = req.body;
    
    // Prepare update data
    const updateData = {};
    
    // Update date and time if provided
    if (date || time) {
        const currentDate = existingSchedule.date;
        const newDate = date ? date : currentDate.toISOString().split('T')[0];
        const newTime = time ? time : currentDate.toISOString().split('T')[1].substring(0, 5);
        
        const dateTimeString = `${newDate}T${newTime}:00Z`;
        const scheduleDateTime = new Date(dateTimeString);
        
        if(isNaN(scheduleDateTime.getTime())) {
            return res.status(400).json({ message: "Invalid date or time format" });
        }
        
        updateData.date = scheduleDateTime;
    }
    
    // Update arrDept if provided
    if (arrDept) {
        updateData.arrDept = arrDept;
    }
    
    // Update schedule
    const updatedSchedule = await client.schedule.update({
        where: { id: scheduleId },
        data: updateData
    });

    res.json({
        message: "Schedule updated successfully",
        schedule: updatedSchedule
    });
};

/**
    method : DELETE
    route : /api/v1/emp/sm/schedule/:id
    description : station manager can remove a specific schedule of a train of his station
    role : station manager
*/

const stationManagerRemoveSchedule = async (req, res) => {
    const stId = await isStationManager(req.emp.empId);
    
    if(!stId) {
        return res.status(401).json({ message: "You are not a station manager" });
    }
    
    const scheduleId = parseInt(req.params.id);
    
    // Check if schedule exists and belongs to this station
    const existingSchedule = await client.schedule.findFirst({
        where: {
            id: scheduleId,
            stationId: stId
        }
    });
    
    if (!existingSchedule) {
        return res.status(404).json({
            message: "Schedule not found or you don't have permission to delete it"
        });
    }
    
    // Delete schedule
    await client.schedule.delete({
        where: { id: scheduleId }
    });

    res.json({
        message: "Schedule removed successfully"
    });
};

/**
    method : GET
    route : /api/v1/emp/shifts
    description : get employee's shifts
    role : all employees
*/

const getEmployeeShifts = async (req, res) => {
    const { empId } = req.emp;
    
    const shifts = await client.shift.findMany({
        where: { employeeId: empId },
        include: {
            station: {
                include: {
                    city: true
                }
            },
            train: true
        }
    });
    
    // Format shift data
    const formattedShifts = shifts.map(shift => ({
        id: shift.id,
        shiftNo: shift.shiftNo,
        station: shift.station ? {
            id: shift.station.id,
            name: shift.station.name,
            city: shift.station.city.city,
            state: shift.station.city.state
        } : null,
        train: shift.train ? {
            id: shift.train.id,
            name: shift.train.trainName,
            status: shift.train.status
        } : null
    }));
    
    res.json({
        message: "Your shifts",
        shifts: formattedShifts
    });
};

/**
    method : GET
    route : /api/v1/emp/lp/trains
    description : loco pilot can get assigned trains
    role : loco pilot
*/

const locoPilotGetTrains = async (req, res) => {
    const { empId } = req.emp;
    
    // Check if employee is a loco pilot
    const employee = await client.employee.findUnique({
        where: { id: empId }
    });
    
    if (!employee || employee.role !== 'loco_pilot') {
        return res.status(401).json({
            message: "You are not authorized as a loco pilot"
        });
    }
    
    // Get trains assigned to this loco pilot
    const trains = await client.train.findMany({
        where: { locoPilotId: empId },
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
            schedules: {
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
    
    res.json({
        message: "Your assigned trains",
        trains
    });
};

module.exports = { 
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
};


