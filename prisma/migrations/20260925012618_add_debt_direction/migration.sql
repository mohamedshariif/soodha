/*
  Warnings:

  - The values [CARD,OTHER] on the enum `AccountType` will be removed. If these variants are still used in the database, this will fail.
  - The values [BUDGET_ADJUSTMENT,AYUUTO_CONTRIBUTION,AYUUTO_PAYOUT] on the enum `TransactionSourceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "DebtDirection" AS ENUM ('I_OWE', 'OWED_TO_ME');

-- AlterEnum
BEGIN;
CREATE TYPE "AccountType_new" AS ENUM ('CASH', 'BANK', 'MOBILE_MONEY');
ALTER TABLE "accounts" ALTER COLUMN "type" TYPE "AccountType_new" USING ("type"::text::"AccountType_new");
ALTER TYPE "AccountType" RENAME TO "AccountType_old";
ALTER TYPE "AccountType_new" RENAME TO "AccountType";
DROP TYPE "public"."AccountType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionSourceType_new" AS ENUM ('MANUAL', 'BILL_PAYMENT', 'SAVINGS_CONTRIBUTION', 'DEBT_PAYMENT', 'DEBT_COLLECTION');
ALTER TABLE "public"."transactions" ALTER COLUMN "source_type" DROP DEFAULT;
ALTER TABLE "transactions" ALTER COLUMN "source_type" TYPE "TransactionSourceType_new" USING ("source_type"::text::"TransactionSourceType_new");
ALTER TYPE "TransactionSourceType" RENAME TO "TransactionSourceType_old";
ALTER TYPE "TransactionSourceType_new" RENAME TO "TransactionSourceType";
DROP TYPE "public"."TransactionSourceType_old";
ALTER TABLE "transactions" ALTER COLUMN "source_type" SET DEFAULT 'MANUAL';
COMMIT;

-- AlterTable
ALTER TABLE "debts" ADD COLUMN     "direction" "DebtDirection" NOT NULL DEFAULT 'I_OWE';

-- CreateIndex
CREATE INDEX "debts_user_id_direction_idx" ON "debts"("user_id", "direction");
