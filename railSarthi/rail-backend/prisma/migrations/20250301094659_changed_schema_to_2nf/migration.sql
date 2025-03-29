/*
  Warnings:

  - You are about to drop the column `shiftNo` on the `BookingClerk` table. All the data in the column will be lost.
  - The primary key for the `Coach` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `seatNo` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `seatType` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `shiftNo` on the `LocoPilot` table. All the data in the column will be lost.
  - The primary key for the `Schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `city` on the `Station` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Station` table. All the data in the column will be lost.
  - You are about to drop the column `shiftNo` on the `StationManager` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cityId` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cityId` to the `Station` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cityId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BookingClerk_stationId_key";

-- DropIndex
DROP INDEX "StationManager_stationId_key";

-- AlterTable
ALTER TABLE "BookingClerk" DROP COLUMN "shiftNo";

-- AlterTable
CREATE SEQUENCE coach_id_seq;
ALTER TABLE "Coach" DROP CONSTRAINT "Coach_pkey",
DROP COLUMN "seatNo",
DROP COLUMN "seatType",
ALTER COLUMN "id" SET DEFAULT nextval('coach_id_seq'),
ADD CONSTRAINT "Coach_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE coach_id_seq OWNED BY "Coach"."id";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "city",
DROP COLUMN "state",
ADD COLUMN     "cityId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "LocoPilot" DROP COLUMN "shiftNo";

-- AlterTable
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Station" DROP COLUMN "city",
DROP COLUMN "state",
ADD COLUMN     "cityId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StationManager" DROP COLUMN "shiftNo";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "city",
DROP COLUMN "state",
ADD COLUMN     "cityId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "admin";

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" SERIAL NOT NULL,
    "coachId" INTEGER NOT NULL,
    "seatNo" INTEGER NOT NULL,
    "seatType" "seatType" NOT NULL,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "createdByAdmin" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seat_coachId_seatNo_key" ON "Seat"("coachId", "seatNo");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
