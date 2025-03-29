-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "createdByAdmin" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);
