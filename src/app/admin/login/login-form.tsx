"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionState } from "react"
import { login } from "./actions"

export function LoginForm() {
  const [error, action, isPending] = useActionState(login, undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Administration</CardTitle>
        <CardDescription>Entrez vos identifiants pour accéder au tableau de bord.</CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="admin@fleurs-gourmandes54.fr" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Connexion..." : "Se connecter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

