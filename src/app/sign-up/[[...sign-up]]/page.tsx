import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <SignUp 
        fallbackRedirectUrl="/dashboard"
        signInUrl="/sign-in"
        signInFallbackRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#059669",
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