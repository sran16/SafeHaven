-- CreateTable
CREATE TABLE `Users` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `registration_Date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Users_email_key`(`email`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Moods` (
    `id_mood` INTEGER NOT NULL AUTO_INCREMENT,
    `dateRegistration` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `moodType` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id_mood`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ToDoLists` (
    `id_list` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `status` BOOLEAN NOT NULL,
    `registrationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id_list`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chatbot_sessions` (
    `id_session` INTEGER NOT NULL AUTO_INCREMENT,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id_session`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IA` (
    `id_IA` INTEGER NOT NULL AUTO_INCREMENT,
    `sentimentAnalysis` VARCHAR(191) NOT NULL,
    `recommendation` VARCHAR(191) NOT NULL,
    `reportGenerated` VARCHAR(191) NOT NULL,
    `conversationHistory` VARCHAR(191) NOT NULL,
    `chatbotSessionId` INTEGER NOT NULL,

    UNIQUE INDEX `IA_chatbotSessionId_key`(`chatbotSessionId`),
    PRIMARY KEY (`id_IA`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Experiences` (
    `id_experience` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(191) NOT NULL,
    `publication_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `moderateurId` INTEGER NULL,

    PRIMARY KEY (`id_experience`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Answers` (
    `id_response` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(191) NOT NULL,
    `publicationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `experienceId` INTEGER NOT NULL,

    PRIMARY KEY (`id_response`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Moderateurs` (
    `id_moderateur` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id_moderateur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Moods` ADD CONSTRAINT `Moods_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ToDoLists` ADD CONSTRAINT `ToDoLists_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chatbot_sessions` ADD CONSTRAINT `Chatbot_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IA` ADD CONSTRAINT `IA_chatbotSessionId_fkey` FOREIGN KEY (`chatbotSessionId`) REFERENCES `Chatbot_sessions`(`id_session`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Experiences` ADD CONSTRAINT `Experiences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Experiences` ADD CONSTRAINT `Experiences_moderateurId_fkey` FOREIGN KEY (`moderateurId`) REFERENCES `Moderateurs`(`id_moderateur`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Answers` ADD CONSTRAINT `Answers_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `Experiences`(`id_experience`) ON DELETE CASCADE ON UPDATE CASCADE;
