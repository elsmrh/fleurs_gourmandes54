"use client"

import { useState } from "react"
import { Loader2, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Edit2, X, ImagePlus, Check, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { uploadImageAction } from "@/app/actions/upload"

interface Service {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  badge: string
  active: boolean
  order: number
}

interface ServiceManagerProps {
  initialServices: Service[]
}

export default function ServiceManager({ initialServices }: ServiceManagerProps) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Service>>({})
  
  const [isAdding, setIsAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Service | null>(null)

  const handleStartEdit = (service: Service | null) => {
    if (service) {
      setEditingId(service.id)
      setEditForm(service)
    } else {
      setEditingId("NEW")
      setEditForm({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        badge: "",
        active: true
      })
    }
  }

  const handleSave = async () => {
    if (!editForm.name) return
    setIsAdding(true)
    try {
      if (editingId === "NEW") {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        })
        const data = await res.json()
        if (data.id) setServices(prev => [...prev, data])
      } else {
        const res = await fetch(`/api/services/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        })
        const data = await res.json()
        if (data.id) setServices(prev => prev.map(s => s.id === data.id ? data : s))
      }
      setEditingId(null)
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggle = async (service: Service) => {
    setLoadingId(service.id)
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !service.active }),
      })
      const data = await res.json()
      if (data.id) {
        setServices(prev => prev.map(s => s.id === service.id ? data : s))
      }
    } finally {
      setLoadingId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return
    const id = confirmDelete.id
    setLoadingId(id)
    try {
      await fetch(`/api/services/${id}`, { method: "DELETE" })
      setServices(prev => prev.filter(s => s.id !== id))
      setConfirmDelete(null)
    } finally {
      setLoadingId(null)
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === services.length - 1)) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newArr = [...services]
    const temp = newArr[index]
    newArr[index] = newArr[newIndex]
    newArr[newIndex] = temp
    
    setServices(newArr)
    setLoadingId(temp.id)

    const payload = newArr.map((s, i) => ({ id: s.id, order: i }))
    try {
      await fetch('/api/services/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-stone-50/50">
          <h3 className="font-semibold text-gray-700">Bouquets disponibles</h3>
          <Button onClick={() => handleStartEdit(null)} size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un bouquet
          </Button>
        </div>

        {services.length === 0 && editingId !== "NEW" ? (
          <div className="text-center py-12 text-gray-400">Aucun bouquet configuré.</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {services.map((service, index) => (
              <li key={service.id} className={`p-4 sm:p-6 transition-all duration-200 relative ${!service.active ? "bg-stone-50/50 opacity-75" : "bg-white hover:bg-stone-50/30 hover:shadow-sm"}`}>
                {editingId === service.id ? (
                  <EditForm form={editForm} setForm={setEditForm} onCancel={() => setEditingId(null)} onSave={handleSave} isSaving={isAdding} />
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    {/* Left: Info Block */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Image */}
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-gray-100 shadow-sm flex-shrink-0 bg-white" />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-stone-50 flex items-center justify-center text-gray-400 text-[10px] uppercase font-bold text-center p-2 border border-gray-100 flex-shrink-0 shadow-sm">Sans image</div>
                      )}
                      
                      {/* Text Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-base sm:text-lg truncate">{service.name}</h4>
                          {service.badge && <span className="bg-pink-100 text-pink-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide whitespace-nowrap">{service.badge}</span>}
                          {!service.active && <span className="bg-gray-100 text-gray-500 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase whitespace-nowrap">Désactivé</span>}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-0.5 pr-2">{service.description}</p>
                        <p className="font-black text-pink-600 mt-2 text-base sm:text-lg">{service.price} €</p>
                      </div>
                    </div>

                    {/* Right/Bottom: Actions */}
                    <div className="flex items-center justify-between sm:justify-end border-t border-gray-50 sm:border-0 pt-4 sm:pt-0 mt-1 sm:mt-0 gap-3 sm:gap-4">
                      {/* Move Buttons (Horizontal) */}
                      <div className="flex items-center gap-0.5 bg-stone-50 rounded-lg p-1 border border-stone-200/60 shadow-sm">
                        <button onClick={() => handleMove(index, 'up')} disabled={loadingId !== null || index === 0} className="p-1.5 text-gray-400 hover:text-gray-800 disabled:opacity-30 hover:bg-white rounded-md transition-colors shadow-sm-hover" title="Monter">
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-0.5"></div>
                        <button onClick={() => handleMove(index, 'down')} disabled={loadingId !== null || index === services.length - 1} className="p-1.5 text-gray-400 hover:text-gray-800 disabled:opacity-30 hover:bg-white rounded-md transition-colors shadow-sm-hover" title="Descendre">
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleStartEdit(service)} disabled={loadingId !== null} className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm transition-all" title="Modifier">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggle(service)} disabled={loadingId === service.id} className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 hover:shadow-sm transition-all" title={service.active ? "Désactiver" : "Activer"}>
                          {loadingId === service.id ? <Loader2 className="w-4 h-4 animate-spin" /> : service.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setConfirmDelete(service)} disabled={loadingId === service.id} className="p-2 rounded-lg bg-white border border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-600 hover:shadow-sm transition-all" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
            
            {editingId === "NEW" && (
              <li className="p-6 bg-pink-50/30">
                <EditForm form={editForm} setForm={setEditForm} onCancel={() => setEditingId(null)} onSave={handleSave} isSaving={isAdding} />
              </li>
            )}
          </ul>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 shrink-0 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Supprimer « {confirmDelete.name} » ?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Ce bouquet sera définitivement retiré du catalogue. Astuce : vous pouvez simplement le masquer avec l&apos;icône œil.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-stone-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loadingId === confirmDelete.id}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 transition-colors"
              >
                {loadingId === confirmDelete.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EditForm({ form, setForm, onCancel, onSave, isSaving }: { form: Partial<Service>, setForm: any, onCancel: () => void, onSave: () => void, isSaving: boolean }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const url = await uploadImageAction(formData)
      setForm({...form, imageUrl: url})
    } catch (error) {
      console.error(error)
      alert("Erreur lors de l'upload de l'image.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-pink-500/5 border border-pink-100/60 my-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">{form.name ? "Modifier le bouquet" : "Nouveau bouquet"}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left: Image Upload */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Image du bouquet</label>
          <label className="relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-200 hover:border-pink-300 rounded-2xl bg-stone-50 hover:bg-pink-50/30 transition-all cursor-pointer overflow-hidden group">
            {form.imageUrl ? (
              <>
                <img src={form.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <ImagePlus className="w-6 h-6 text-white" />
                  <span className="text-white font-medium text-xs">Modifier l'image</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-gray-400 group-hover:text-pink-500 transition-colors">
                <ImagePlus className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-sm font-semibold">Ajouter une photo</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-50">JPG, PNG (max 5MB)</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            {isUploading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Loader2 className="w-6 h-6 animate-spin text-pink-500 mb-2" />
                <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">Envoi en cours...</span>
              </div>
            )}
          </label>
        </div>

        {/* Right: Form fields */}
        <div className="md:col-span-8 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Nom du bouquet</label>
              <Input value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Bouquet Charme" className="bg-stone-50/50 border-gray-200 focus-visible:ring-pink-500 rounded-xl shadow-sm h-11" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700">Prix (€)</label>
              <Input type="number" value={form.price || ""} onChange={e => setForm({...form, price: parseFloat(e.target.value) || 0})} placeholder="35" className="bg-stone-50/50 border-gray-200 focus-visible:ring-pink-500 rounded-xl shadow-sm h-11" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">Description</label>
            <textarea
              rows={3}
              value={form.description || ""}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Ex: 12 cupcakes • 2 parfums au choix • Idéal pour un anniversaire..."
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50/50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-xl shadow-sm resize-y"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700">Badge (Optionnel)</label>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Met en valeur le produit</span>
            </div>
            <Input value={form.badge || ""} onChange={e => setForm({...form, badge: e.target.value})} placeholder="Ex: BEST-SELLER, NOUVEAUTÉ..." className="bg-stone-50/50 border-gray-200 focus-visible:ring-pink-500 rounded-xl shadow-sm h-11 font-medium text-pink-700 placeholder:text-gray-400 placeholder:font-normal" />
          </div>
        </div>

      </div>
      
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
        <Button variant="outline" onClick={onCancel} disabled={isSaving || isUploading} className="w-full sm:w-auto rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold h-11 px-6">
          Annuler
        </Button>
        <Button onClick={onSave} disabled={isSaving || isUploading || !form.name} className="w-full sm:w-auto rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-md shadow-pink-500/20 h-11 px-6">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
          Enregistrer le bouquet
        </Button>
      </div>
    </div>
  )
}

