-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "pin" TEXT,
    "lastDevice" TEXT,
    "loginOTP" TEXT,
    "loginOTPExpires" DATETIME,
    "accountNumber" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0.00,
    "walletIndex" INTEGER NOT NULL,
    "ethAddress" TEXT NOT NULL,
    "btcAddress" TEXT NOT NULL,
    "solAddress" TEXT NOT NULL,
    "trxAddress" TEXT NOT NULL,
    "kycStatus" TEXT NOT NULL DEFAULT 'NOT_VERIFIED',
    "kycFront" TEXT,
    "kycBack" TEXT,
    "kycSelfie" TEXT,
    "verificationCode" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountNumber_key" ON "User"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletIndex_key" ON "User"("walletIndex");
