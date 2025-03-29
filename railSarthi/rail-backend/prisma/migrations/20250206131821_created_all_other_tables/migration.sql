-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationManager" (
    "employeeId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,
    "shiftNo" INTEGER NOT NULL,

    CONSTRAINT "StationManager_pkey" PRIMARY KEY ("employeeId","stationId")
);

-- CreateTable
CREATE TABLE "BookingClerk" (
    "employeeId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,
    "shiftNo" INTEGER NOT NULL,

    CONSTRAINT "BookingClerk_pkey" PRIMARY KEY ("employeeId","stationId")
);

-- CreateTable
CREATE TABLE "LocoPilot" (
    "employeeId" INTEGER NOT NULL,
    "startStationId" INTEGER NOT NULL,
    "destStationId" INTEGER NOT NULL,
    "shiftNo" INTEGER NOT NULL,

    CONSTRAINT "LocoPilot_pkey" PRIMARY KEY ("employeeId","startStationId","destStationId")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Train" (
    "id" SERIAL NOT NULL,
    "trainNo" INTEGER NOT NULL,
    "trainName" TEXT NOT NULL,
    "sourceSt" INTEGER NOT NULL,
    "destSt" INTEGER NOT NULL,
    "noOfCoaches" INTEGER NOT NULL,
    "noOfSeats" INTEGER NOT NULL,
    "locoPilotId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Train_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "trainId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "arrDept" TEXT NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("trainId","stationId","date")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "deptTime" TIMESTAMP(3) NOT NULL,
    "arrTime" TIMESTAMP(3) NOT NULL,
    "boardingStId" INTEGER NOT NULL,
    "destId" INTEGER NOT NULL,
    "trainId" INTEGER NOT NULL,
    "distance" INTEGER NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "pnr" INTEGER NOT NULL,
    "coachId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tripId" INTEGER NOT NULL,
    "quota" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("pnr")
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" SERIAL NOT NULL,
    "seatNo" INTEGER NOT NULL,
    "seatType" TEXT NOT NULL,
    "noOfSeats" INTEGER NOT NULL,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StationManager_employeeId_key" ON "StationManager"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "StationManager_stationId_key" ON "StationManager"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingClerk_employeeId_key" ON "BookingClerk"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingClerk_stationId_key" ON "BookingClerk"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "LocoPilot_employeeId_key" ON "LocoPilot"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "LocoPilot_startStationId_key" ON "LocoPilot"("startStationId");

-- CreateIndex
CREATE UNIQUE INDEX "LocoPilot_destStationId_key" ON "LocoPilot"("destStationId");

-- AddForeignKey
ALTER TABLE "StationManager" ADD CONSTRAINT "StationManager_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationManager" ADD CONSTRAINT "StationManager_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingClerk" ADD CONSTRAINT "BookingClerk_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingClerk" ADD CONSTRAINT "BookingClerk_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocoPilot" ADD CONSTRAINT "LocoPilot_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocoPilot" ADD CONSTRAINT "LocoPilot_startStationId_fkey" FOREIGN KEY ("startStationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocoPilot" ADD CONSTRAINT "LocoPilot_destStationId_fkey" FOREIGN KEY ("destStationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_boardingStId_fkey" FOREIGN KEY ("boardingStId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_destId_fkey" FOREIGN KEY ("destId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
