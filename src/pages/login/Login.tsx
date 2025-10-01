
import { LoginForm } from "@/features/login/LoginForm"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <LoginForm />
      </div>
    </div>
  )
}
