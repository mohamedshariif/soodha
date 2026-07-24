/*
  Warnings:

  - You are about to drop the column `due_date` on the `bills` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `budgets` table. All the data in the column will be lost.
  - Added the required column `next_due_date` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period_end` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period_start` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Made the column `user_id` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "BudgetPeriod" ADD VALUE 'CUSTOM';

-- DropForeignKey
ALTER TABLE "bills" DROP CONSTRAINT "bills_category_id_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_category_id_fkey";

-- DropIndex
DROP INDEX "bills_due_date_idx";

-- DropIndex
DROP INDEX "budgets_year_month_idx";

-- DropIndex
DROP INDEX "categories_status_idx";

-- DropIndex
DROP INDEX "categories_type_idx";

-- DropIndex
DROP INDEX "transactions_user_id_type_idx";

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "app_users" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "bills" DROP COLUMN "due_date",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "next_due_date" DATE NOT NULL,
ALTER COLUMN "category_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "budgets" DROP COLUMN "month",
DROP COLUMN "year",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "period_end" DATE NOT NULL,
ADD COLUMN     "period_start" DATE NOT NULL,
ALTER COLUMN "period" SET DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "debts" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "savings_goals" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "category_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "bill_payments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "due_date" DATE NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount_minor" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bill_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_contributions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "savings_goal_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "contribution_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_payments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "debt_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bill_payments_transaction_id_key" ON "bill_payments"("transaction_id");

-- CreateIndex
CREATE INDEX "bill_payments_user_id_idx" ON "bill_payments"("user_id");

-- CreateIndex
CREATE INDEX "bill_payments_bill_id_idx" ON "bill_payments"("bill_id");

-- CreateIndex
CREATE INDEX "bill_payments_due_date_idx" ON "bill_payments"("due_date");

-- CreateIndex
CREATE INDEX "bill_payments_paid_at_idx" ON "bill_payments"("paid_at");

-- CreateIndex
CREATE UNIQUE INDEX "savings_contributions_transaction_id_key" ON "savings_contributions"("transaction_id");

-- CreateIndex
CREATE INDEX "savings_contributions_user_id_idx" ON "savings_contributions"("user_id");

-- CreateIndex
CREATE INDEX "savings_contributions_savings_goal_id_idx" ON "savings_contributions"("savings_goal_id");

-- CreateIndex
CREATE INDEX "savings_contributions_contribution_date_idx" ON "savings_contributions"("contribution_date");

-- CreateIndex
CREATE UNIQUE INDEX "debt_payments_transaction_id_key" ON "debt_payments"("transaction_id");

-- CreateIndex
CREATE INDEX "debt_payments_user_id_idx" ON "debt_payments"("user_id");

-- CreateIndex
CREATE INDEX "debt_payments_debt_id_idx" ON "debt_payments"("debt_id");

-- CreateIndex
CREATE INDEX "debt_payments_paid_at_idx" ON "debt_payments"("paid_at");

-- CreateIndex
CREATE INDEX "accounts_user_id_is_default_idx" ON "accounts"("user_id", "is_default");

-- CreateIndex
CREATE INDEX "accounts_user_id_deleted_at_idx" ON "accounts"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "bills_next_due_date_idx" ON "bills"("next_due_date");

-- CreateIndex
CREATE INDEX "bills_user_id_deleted_at_idx" ON "bills"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "budgets_period_start_period_end_idx" ON "budgets"("period_start", "period_end");

-- CreateIndex
CREATE INDEX "budgets_user_id_deleted_at_idx" ON "budgets"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "categories_user_id_type_idx" ON "categories"("user_id", "type");

-- CreateIndex
CREATE INDEX "categories_user_id_status_idx" ON "categories"("user_id", "status");

-- CreateIndex
CREATE INDEX "categories_user_id_deleted_at_idx" ON "categories"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "debts_user_id_deleted_at_idx" ON "debts"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "savings_goals_user_id_deleted_at_idx" ON "savings_goals"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "transactions_user_id_transaction_date_idx" ON "transactions"("user_id", "transaction_date");

-- CreateIndex
CREATE INDEX "transactions_user_id_type_transaction_date_idx" ON "transactions"("user_id", "type", "transaction_date");

-- CreateIndex
CREATE INDEX "transactions_user_id_deleted_at_idx" ON "transactions"("user_id", "deleted_at");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_savings_goal_id_fkey" FOREIGN KEY ("savings_goal_id") REFERENCES "savings_goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "debts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_payments" ADD CONSTRAINT "debt_payments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
