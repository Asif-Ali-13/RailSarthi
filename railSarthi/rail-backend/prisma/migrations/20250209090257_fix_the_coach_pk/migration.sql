/*
  Warnings:

  - The primary key for the `Coach` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Coach" DROP CONSTRAINT "Coach_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ADD CONSTRAINT "Coach_pkey" PRIMARY KEY ("id", "seatNo");
DROP SEQUENCE "Coach_id_seq";
