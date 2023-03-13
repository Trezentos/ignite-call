/*
  Warnings:

  - You are about to drop the column `time_end_in_minute` on the `user_time_intervals` table. All the data in the column will be lost.
  - Added the required column `time_end_in_minutes` to the `user_time_intervals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user_time_intervals` DROP COLUMN `time_end_in_minute`,
    ADD COLUMN `time_end_in_minutes` INTEGER NOT NULL;
