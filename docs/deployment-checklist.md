# Soodha Deployment Checklist

Before deploying to production, check:

## Database
- Use Neon pooled connection string for runtime/app usage.
- Use direct database connection for Prisma migrations if needed.
- Confirm `DATABASE_URL` is set correctly in Vercel.
- Never commit `.env` files.
- Run final Prisma migration before deployment.

## Prisma
- Confirm Prisma Client generates correctly.
- Confirm `src/lib/prisma.ts` works in production.
- Confirm Neon adapter setup is correct.
- Check whether `prisma.config.ts` needs directUrl/migration configuration.

## Authentication
- Use production Clerk keys.
- Configure allowed redirect URLs.
- Protect private routes.
- Confirm internal `app_users` record is created after signup/login.

## App
- Test dashboard, transactions, budgets, bills, savings, debts.
- Test mobile responsive layout.
- Test empty states and loading states.
- Test error messages.
- Confirm no secret keys are exposed.

## Hosting
- Deploy to Vercel.
- Choose a region close to Neon region if possible.
- Confirm production build passes.