-- CreateTable
CREATE TABLE "ActiveSessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deviceInfo" TEXT,

    CONSTRAINT "ActiveSessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActiveSessions_token_key" ON "ActiveSessions"("token");

-- CreateIndex
CREATE INDEX "ActiveSessions_userId_idx" ON "ActiveSessions"("userId");

-- CreateIndex
CREATE INDEX "ActiveSessions_token_idx" ON "ActiveSessions"("token");

-- CreateIndex
CREATE INDEX "ActiveSessions_expiresAt_idx" ON "ActiveSessions"("expiresAt");

-- CreateIndex
CREATE INDEX "ActiveSessions_isActive_idx" ON "ActiveSessions"("isActive");

-- AddForeignKey
ALTER TABLE "ActiveSessions" ADD CONSTRAINT "ActiveSessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
