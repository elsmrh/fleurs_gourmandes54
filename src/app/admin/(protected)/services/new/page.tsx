import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default function NewServicePage() {
  async function createService(formData: FormData) {
    "use server"
    
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = parseFloat(formData.get("price") as string)
    const duration = parseInt(formData.get("duration") as string)
    
    await prisma.service.create({
      data: {
        name,
        description,
        price,
        duration,
      }
    })
    
    redirect("/admin/services")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Nouvelle Création</h2>
        <p className="text-gray-500">Ajoutez un nouveau bouquet de cupcakes ou gâteau à votre catalogue.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la création</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createService} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la création (ex: Bouquet 7 Cupcakes)</Label>
              <Input id="name" name="name" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Parfums, fleurs représentées...)</Label>
              <textarea 
                id="description" 
                name="description" 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix (€)</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Durée / Créneau estimé (en min)</Label>
                <Input id="duration" name="duration" type="number" defaultValue="30" required />
                <p className="text-xs text-gray-500">Ex: 30 minutes pour un créneau de retrait.</p>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <a href="/admin/services">Annuler</a>
              </Button>
              <Button type="submit" className="bg-pink-600 hover:bg-pink-700">Enregistrer</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

