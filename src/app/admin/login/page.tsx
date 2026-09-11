import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Fleurs Gourmandes 54
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous à l'espace administration
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

