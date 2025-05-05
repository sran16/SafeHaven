-- CreateTable
CREATE TABLE "Users" (
    "id_user" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "registration_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Moods" (
    "id_mood" SERIAL NOT NULL,
    "dateRegistration" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moodType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Moods_pkey" PRIMARY KEY ("id_mood")
);

-- CreateTable
CREATE TABLE "Chatbot_sessions" (
    "id_session" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Chatbot_sessions_pkey" PRIMARY KEY ("id_session")
);

-- CreateTable
CREATE TABLE "IA" (
    "id_IA" SERIAL NOT NULL,
    "sentimentAnalysis" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "reportGenerated" TEXT NOT NULL,
    "conversationHistory" TEXT NOT NULL,
    "chatbotSessionId" INTEGER NOT NULL,

    CONSTRAINT "IA_pkey" PRIMARY KEY ("id_IA")
);

-- CreateTable
CREATE TABLE "Experiences" (
    "id_experience" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "publication_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "moderateurId" INTEGER,

    CONSTRAINT "Experiences_pkey" PRIMARY KEY ("id_experience")
);

-- CreateTable
CREATE TABLE "Answers" (
    "id_response" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experienceId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("id_response")
);

-- CreateTable
CREATE TABLE "Moderateurs" (
    "id_moderateur" SERIAL NOT NULL,

    CONSTRAINT "Moderateurs_pkey" PRIMARY KEY ("id_moderateur")
);

-- CreateTable
CREATE TABLE "UserLogs" (
    "id_log" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserLogs_pkey" PRIMARY KEY ("id_log")
);

-- CreateTable
CREATE TABLE "ModerationLogs" (
    "id_log" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experienceId" INTEGER,
    "moderatorId" INTEGER NOT NULL,

    CONSTRAINT "ModerationLogs_pkey" PRIMARY KEY ("id_log")
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

-- AddForeignKey
ALTER TABLE "Moods" ADD CONSTRAINT "Moods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatbot_sessions" ADD CONSTRAINT "Chatbot_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IA" ADD CONSTRAINT "IA_chatbotSessionId_fkey" FOREIGN KEY ("chatbotSessionId") REFERENCES "Chatbot_sessions"("id_session") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiences" ADD CONSTRAINT "Experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experiences" ADD CONSTRAINT "Experiences_moderateurId_fkey" FOREIGN KEY ("moderateurId") REFERENCES "Moderateurs"("id_moderateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experiences"("id_experience") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLogs" ADD CONSTRAINT "UserLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLogs" ADD CONSTRAINT "ModerationLogs_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experiences"("id_experience") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLogs" ADD CONSTRAINT "ModerationLogs_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Moderateurs"("id_moderateur") ON DELETE CASCADE ON UPDATE CASCADE;
