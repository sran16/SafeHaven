-- CreateTable
CREATE TABLE "Session_Reports" (
    "id_report" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "distressLevel" INTEGER NOT NULL,
    "emergency" BOOLEAN NOT NULL DEFAULT false,
    "sentiment" TEXT NOT NULL,
    "topics" TEXT[],
    "language" TEXT NOT NULL,
    "immediateRecommendations" TEXT[],
    "longTermRecommendations" TEXT[],
    "followUpNeeded" BOOLEAN NOT NULL DEFAULT false,
    "followUpUrgency" TEXT NOT NULL,
    "suggestedTiming" TEXT NOT NULL,
    "professionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_Reports_pkey" PRIMARY KEY ("id_report")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_Reports_sessionId_key" ON "Session_Reports"("sessionId");

-- CreateIndex
CREATE INDEX "Session_Reports_createdAt_idx" ON "Session_Reports"("createdAt");

-- CreateIndex
CREATE INDEX "Session_Reports_distressLevel_idx" ON "Session_Reports"("distressLevel");

-- CreateIndex
CREATE INDEX "Session_Reports_emergency_idx" ON "Session_Reports"("emergency");

-- AddForeignKey
ALTER TABLE "Session_Reports" ADD CONSTRAINT "Session_Reports_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Chatbot_sessions"("id_session") ON DELETE CASCADE ON UPDATE CASCADE;
