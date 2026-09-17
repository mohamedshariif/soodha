import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <SignIn 
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
        appearance={{
          variables: {
            colorPrimary: "#D4A017",
            borderRadius: "0.75rem",
          },
          elements: {
            card: "shadow-none border border-border bg-card",
          },
        }}
      />
    </main>
  )
}