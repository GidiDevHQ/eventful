/*
  Warnings:

  - Added the required column `category` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- 1. Handle the Event table
-- Add 'category' with a temporary default to update existing rows, then drop the default
ALTER TABLE "Event" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Uncategorized';
ALTER TABLE "Event" ALTER COLUMN "category" DROP DEFAULT;

-- 2. Handle the Reminder table
-- Add 'updatedAt' with a temporary default of the current time, then drop the default
ALTER TABLE "Reminder" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Reminder" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- 3. Set the Primary Key on Reminder (from your original migration)
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id");
