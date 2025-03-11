-- CreateTable
CREATE TABLE "Users" (
    "id_user" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "registration_Date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Moods" (
    "id_mood" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateRegistration" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moodType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Moods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id_user") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ToDoLists" (
    "id_list" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "status" BOOLEAN NOT NULL,
    "registrationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ToDoLists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id_user") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chatbot_sessions" (
    "id_session" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Chatbot_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id_user") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IA" (
    "id_IA" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sentimentAnalysis" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "reportGenerated" TEXT NOT NULL,
    "conversationHistory" TEXT NOT NULL,
    "chatbotSessionId" INTEGER NOT NULL,
    CONSTRAINT "IA_chatbotSessionId_fkey" FOREIGN KEY ("chatbotSessionId") REFERENCES "Chatbot_sessions" ("id_session") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Experiences" (
    "id_experience" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "publication_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "moderateurId" INTEGER,
    CONSTRAINT "Experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id_user") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Experiences_moderateurId_fkey" FOREIGN KEY ("moderateurId") REFERENCES "Moderateurs" ("id_moderateur") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Answers" (
    "id_response" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "publicationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experienceId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Answers_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experiences" ("id_experience") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id_user") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Moderateurs" (
    "id_moderateur" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "UserLogs" (
    "id_log" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "UserLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users" ("id_user") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModerationLogs" (
    "id_log" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experienceId" INTEGER,
    "moderatorId" INTEGER NOT NULL,
    CONSTRAINT "ModerationLogs_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experiences" ("id_experience") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ModerationLogs_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Moderateurs" ("id_moderateur") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_email_idx" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Users_registration_Date_idx" ON "Users"("registration_Date");

-- CreateIndex
CREATE INDEX "Moods_dateRegistration_idx" ON "Moods"("dateRegistration");

-- CreateIndex
CREATE INDEX "ToDoLists_registrationDate_idx" ON "ToDoLists"("registrationDate");

-- CreateIndex
CREATE UNIQUE INDEX "IA_chatbotSessionId_key" ON "IA"("chatbotSessionId");

-- CreateIndex
CREATE INDEX "Experiences_publication_date_idx" ON "Experiences"("publication_date");

-- CreateIndex
CREATE INDEX "Answers_publicationDate_idx" ON "Answers"("publicationDate");

-- CreateIndex
CREATE INDEX "Moderateurs_id_moderateur_idx" ON "Moderateurs"("id_moderateur");

-- CreateIndex
CREATE INDEX "UserLogs_timestamp_idx" ON "UserLogs"("timestamp");

-- CreateIndex
CREATE INDEX "ModerationLogs_timestamp_idx" ON "ModerationLogs"("timestamp");
