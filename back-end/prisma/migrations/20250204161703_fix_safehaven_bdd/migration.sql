/*
  Warnings:

  - You are about to alter the column `moodType` on the `Moods` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to alter the column `name` on the `ToDoLists` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `name` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `Answers` MODIFY `content` VARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE `Experiences` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `IA` MODIFY `sentimentAnalysis` VARCHAR(500) NOT NULL,
    MODIFY `recommendation` VARCHAR(500) NOT NULL,
    MODIFY `reportGenerated` VARCHAR(500) NOT NULL,
    MODIFY `conversationHistory` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Moods` MODIFY `moodType` VARCHAR(50) NOT NULL,
    MODIFY `description` VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE `ToDoLists` MODIFY `name` VARCHAR(100) NOT NULL,
    MODIFY `notes` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `Users` MODIFY `name` VARCHAR(100) NOT NULL,
    MODIFY `email` VARCHAR(255) NOT NULL,
    MODIFY `password` VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE `UserLogs` (
    `id_log` INTEGER NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(100) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,

    INDEX `UserLogs_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id_log`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModerationLogs` (
    `id_log` INTEGER NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(100) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `experienceId` INTEGER NULL,
    `moderatorId` INTEGER NOT NULL,

    INDEX `ModerationLogs_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id_log`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Answers_publicationDate_idx` ON `Answers`(`publicationDate`);

-- CreateIndex
CREATE INDEX `Experiences_publication_date_idx` ON `Experiences`(`publication_date`);

-- CreateIndex
CREATE INDEX `Moderateurs_id_moderateur_idx` ON `Moderateurs`(`id_moderateur`);

-- CreateIndex
CREATE INDEX `Moods_dateRegistration_idx` ON `Moods`(`dateRegistration`);

-- CreateIndex
CREATE INDEX `ToDoLists_registrationDate_idx` ON `ToDoLists`(`registrationDate`);

-- CreateIndex
CREATE INDEX `Users_email_idx` ON `Users`(`email`);

-- CreateIndex
CREATE INDEX `Users_registration_Date_idx` ON `Users`(`registration_Date`);

-- AddForeignKey
ALTER TABLE `UserLogs` ADD CONSTRAINT `UserLogs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModerationLogs` ADD CONSTRAINT `ModerationLogs_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `Experiences`(`id_experience`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModerationLogs` ADD CONSTRAINT `ModerationLogs_moderatorId_fkey` FOREIGN KEY (`moderatorId`) REFERENCES `Moderateurs`(`id_moderateur`) ON DELETE CASCADE ON UPDATE CASCADE;
