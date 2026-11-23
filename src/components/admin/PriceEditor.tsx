"use client"

import { useState } from "react"
import { Pencil, X, Check, Loader2, Plus, Trash2 } from "lucide-react"
import { updateOrderLines } from "@/app/actions/order-lines"

interface Supplement {
  name: string
  price: number
}

interface PriceEditorProps {
  bookingId: string
  prestationName: string
  initialPrice: number
  quantity: number
  initialSupplements: Supplement[]
}

export default function PriceEditor({ bookingId, prestationName: initialName, initialPrice, quantity: initialQuantity, initialSupplements }: PriceEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [name, setName] = useState(initialName)
  const [price, setPrice] = useState(initialPrice.toString())
  const [quantity, setQuantity] = useState(initialQuantity.toString())
  const [supplements, setSupplements] = useState<Supplement[]>(initialSupplements)

  const parsedPrice = parseFloat(price) || 0
  const parsedQuantity = parseInt(quantity) || 1
  const supplementsTotal = supplements.reduce((acc, sup) => acc + sup.price, 0)
  const total = (parsedPrice * parsedQuantity) + supplementsTotal

  const currentParsedPrice = initialPrice
  const currentTotal = (currentParsedPrice * initialQuantity) + initialSupplements.reduce((acc, sup) => acc + sup.price, 0)

  const handleSave = async () => {
    if (parsedPrice < 0 || parsedQuantity < 1 || !name.trim()) return

    setIsSaving(true)
    const result = await updateOrderLines(bookingId, name, parsedPrice, parsedQuantity, supplements)
    setIsSaving(false)
    
    if (result.success) {
      setIsEditing(false)
    } else {
      alert("Erreur lors de la modification")
    }
  }

  const addSupplement = () => {
    setSupplements([...supplements, { name: "Livraison", price: 10 }])
  }

  const updateSupplement = (index: number, key: keyof Supplement, value: string | number) => {
    const newSupplements = [...supplements]
    newSupplements[index] = { ...newSupplements[index], [key]: value }
    setSupplements(newSupplements)
  }

  const removeSupplement = (index: number) => {
    setSupplements(supplements.filter((_, i) => i !== index))
  }

  const handleCancel = () => {
    setIsEditing(false)
    setName(initialName)
    setPrice(initialPrice.toString())
    setQuantity(initialQuantity.toString())
    setSupplements(initialSupplements)
  }

  if (!isEditing) {
    return (
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center bg-stone-50 px-4 py-2.5 rounded-lg group cursor-pointer hover:bg-stone-100 transition-colors" onClick={() => setIsEditing(true)}>
          <span className="text-gray-500 font-medium">Ligne principale</span>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900">{initialQuantity} × {initialPrice} €</span>
            <div className="p-1 text-gray-300 group-hover:text-pink-600 rounded transition-all">
              <Pencil className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
        
        {initialSupplements.length > 0 && (
          <div className="pl-4 pr-2 py-2 space-y-2 border-l-2 border-stone-100 ml-2">
            {initialSupplements.map((sup, idx) => (
              <div key={idx} className="flex justify-between items-center text-gray-600">
                <span className="text-xs">+ {sup.name}</span>
                <span className="font-medium text-xs">{sup.price} €</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center border-t border-stone-100 pt-4 mt-2 px-4">
          <span className="font-bold text-gray-900 uppercase tracking-wide text-xs">Total</span>
          <span className="font-black text-pink-600 text-xl">{currentTotal} €</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 text-sm bg-pink-50/20 -mx-2 px-3 py-3 rounded-xl border border-pink-100/50">
      
      {/* Main Line */}
      <div className="space-y-2 bg-white p-3 rounded-lg border border-pink-100 shadow-sm">
        <label className="text-[10px] font-bold text-pink-700 uppercase tracking-wider">Ligne Principale</label>
        <div className="flex flex-col gap-2">
          <input 
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-stone-50/50 font-medium"
            placeholder="Nom de la prestation"
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center w-24 relative">
              <span className="absolute left-3 text-gray-400 text-xs font-semibold uppercase">Qté</span>
              <input 
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full pl-10 pr-2 py-1.5 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-stone-50/50 font-medium"
                min="1"
              />
            </div>
            <span className="text-gray-400 font-bold">×</span>
            <div className="flex items-center flex-1 relative">
              <input 
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-stone-50/50 font-medium text-right"
                step="0.01"
              />
              <span className="absolute right-3 text-gray-500 font-medium">€</span>
            </div>
            <div className="bg-pink-50 text-pink-700 font-bold px-3 py-1.5 rounded-md text-sm border border-pink-100 flex-shrink-0 min-w-[70px] text-center">
              = {(parsedPrice * parsedQuantity).toFixed(2).replace('.00', '')} €
            </div>
          </div>
        </div>
      </div>

      {/* Supplements */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">Suppléments</label>
          <button onClick={addSupplement} className="flex items-center gap-1 text-[10px] font-bold text-pink-600 hover:text-pink-700 uppercase bg-pink-100/50 hover:bg-pink-100 px-2 py-1 rounded transition-colors">
            <Plus className="w-3 h-3" /> Ajouter
          </button>
        </div>
        
        {supplements.length > 0 ? (
          <div className="space-y-2">
            {supplements.map((sup, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input 
                  type="text"
                  value={sup.name}
                  onChange={e => updateSupplement(idx, "name", e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white"
                  placeholder="Ex: Livraison"
                />
                <div className="relative w-24">
                  <input 
                    type="number"
                    value={sup.price}
                    onChange={e => updateSupplement(idx, "price", parseFloat(e.target.value) || 0)}
                    className="w-full pl-2 pr-6 py-1.5 border border-gray-200 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white text-right"
                    step="0.01"
                  />
                  <span className="absolute right-2 top-1.5 text-gray-400 text-xs">€</span>
                </div>
                <button onClick={() => removeSupplement(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic pl-1">Aucun supplément.</div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-pink-200/50 pt-3 mt-2 px-1">
        <div className="flex justify-between items-center">
          <span className="font-bold text-pink-900 uppercase tracking-wide text-[10px]">Nouveau Total</span>
          <span className="font-black text-pink-600 text-xl">{total.toFixed(2).replace('.00', '')} €</span>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={handleCancel} disabled={isSaving} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg disabled:opacity-50 transition-colors shadow-sm text-xs font-semibold">
            Annuler
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white hover:bg-green-600 rounded-lg disabled:opacity-50 transition-colors shadow-sm text-xs font-semibold">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
