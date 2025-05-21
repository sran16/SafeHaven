/*
  Warnings:

  - You are about to drop the column `conversationHistory` on the `IA` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "IA" DROP COLUMN "conversationHistory";

-- CreateTable
CREATE TABLE "Chat_Messages" (
    "id_message" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "isUserMessage" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" INTEGER NOT NULL,

    CONSTRAINT "Chat_Messages_pkey" PRIMARY KEY ("id_message")
);

-- CreateIndex
CREATE INDEX "Chat_Messages_timestamp_idx" ON "Chat_Messages"("timestamp");

-- CreateIndex
CREATE INDEX "Chat_Messages_sessionId_idx" ON "Chat_Messages"("sessionId");

-- AddForeignKey
ALTER TABLE "Chat_Messages" ADD CONSTRAINT "Chat_Messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Chatbot_sessions"("id_session") ON DELETE CASCADE ON UPDATE CASCADE;
