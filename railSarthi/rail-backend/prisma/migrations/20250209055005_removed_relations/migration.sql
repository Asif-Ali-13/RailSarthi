/*
  Warnings:

  - The primary key for the `LocoPilot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `destStationId` on the `LocoPilot` table. All the data in the column will be lost.
  - You are about to drop the column `startStationId` on the `LocoPilot` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `quota` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `trainNo` on the `Train` table. All the data in the column will be lost.
  - You are about to drop the column `arrTime` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `deptTime` on the `Trip` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[trainId]` on the table `LocoPilot` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `seatType` on the `Coach` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `Employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `gender` on the `Employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `trainId` to the `LocoPilot` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `arrDept` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `passengerId` on the `Ticket` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Train` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `gender` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('manager', 'station_manager', 'booking_clerk', 'loco_pilot');

-- CreateEnum
CREATE TYPE "TrainStatus" AS ENUM ('on_time', 'late', 'cancelled');

-- CreateEnum
CREATE TYPE "arrDept" AS ENUM ('D', 'A');

-- CreateEnum
CREATE TYPE "seatType" AS ENUM ('SL', 'SU', 'L', 'M', 'U');

-- DropForeignKey
ALTER TABLE "BookingClerk" DROP CONSTRAINT "BookingClerk_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "BookingClerk" DROP CONSTRAINT "BookingClerk_stationId_fkey";

-- DropForeignKey
ALTER TABLE "LocoPilot" DROP CONSTRAINT "LocoPilot_destStationId_fkey";

-- DropForeignKey
ALTER TABLE "LocoPilot" DROP CONSTRAINT "LocoPilot_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "LocoPilot" DROP CONSTRAINT "LocoPilot_startStationId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_stationId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_trainId_fkey";

-- DropForeignKey
ALTER TABLE "StationManager" DROP CONSTRAINT "StationManager_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "StationManager" DROP CONSTRAINT "StationManager_stationId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_coachId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_passengerId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tripId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_boardingStId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_destId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_trainId_fkey";

-- DropIndex
DROP INDEX "LocoPilot_destStationId_key";

-- DropIndex
DROP INDEX "LocoPilot_startStationId_key";

-- AlterTable
ALTER TABLE "Coach" DROP COLUMN "seatType",
ADD COLUMN     "seatType" "seatType" NOT NULL;

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender" NOT NULL;

-- AlterTable
ALTER TABLE "LocoPilot" DROP CONSTRAINT "LocoPilot_pkey",
DROP COLUMN "destStationId",
DROP COLUMN "startStationId",
ADD COLUMN     "trainId" INTEGER NOT NULL,
ADD CONSTRAINT "LocoPilot_pkey" PRIMARY KEY ("employeeId", "trainId");

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "time",
DROP COLUMN "arrDept",
ADD COLUMN     "arrDept" "arrDept" NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "quota",
DROP COLUMN "passengerId",
ADD COLUMN     "passengerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Train" DROP COLUMN "trainNo",
DROP COLUMN "status",
ADD COLUMN     "status" "TrainStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "arrTime",
DROP COLUMN "deptTime";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "LocoPilot_trainId_key" ON "LocoPilot"("trainId");
