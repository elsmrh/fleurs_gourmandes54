"use client"

import { useState } from "react"
import { Loader2, Plus, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Edit2, Check, X, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Flavor {
  id: string
  name: string
  active: boolean
  order: number
}

interface FlavorManagerProps {
  initialFlavors: Flavor[]
}

export default function FlavorManager({ initialFlavors }: FlavorManagerProps) {
  const [flavors, setFlavors] = useState<Flavor[]>(initialFlavors)
  const [newName, setNewName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<Flavor | null>(null)

  const handleAdd = async () => {
    if (!newName.trim()) return
    setIsAdding(true)
    try {
      const res = await fetch("/api/flavors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const data = await res.json()
      if (data.id) {
        setFlavors(prev => [...prev, data])
        setNewName("")
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleRename = async (flavor: Flavor) => {
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === flavor.name) {
      setEditingId(null)
      return
    }
    setLoadingId(flavor.id)
    try {
      const res = await fetch(`/api/flavors/${flavor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      })
      const data = await res.json()
      if (data.id) {
        setFlavors(prev => prev.map(f => f.id === flavor.id ? data : f))
      }
      setEditingId(null)
    } finally {
      setLoadingId(null)
    }
  }

  const handleToggle = async (flavor: Flavor) => {
    setLoadingId(flavor.id)
    try {
      const res = await fetch(`/api/flavors/${flavor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !flavor.active }),
      })
      const data = await res.json()
      if (data.id) {
        setFlavors(prev => prev.map(f => f.id === flavor.id ? data : f))
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
      await fetch(`/api/flavors/${id}`, { method: "DELETE" })
      setFlavors(prev => prev.filter(f => f.id !== id))
      setConfirmDelete(null)
    } finally {
      setLoadingId(null)
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === flavors.length - 1)
    ) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newFlavors = [...flavors];
    const temp = newFlavors[index];
    newFlavors[index] = newFlavors[newIndex];
    newFlavors[newIndex] = temp;
    
    setFlavors(newFlavors);
    setLoadingId(temp.id);

    const payload = newFlavors.map((f, i) => ({ id: f.id, order: i }));

    try {
      await fetch('/api/flavors/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add new flavor */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Ajouter un parfum</h3>
        <div className="flex gap-3">
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Ex : Tiramisu, Caramel beurre salé..."
            className="flex-1 bg-stone-50 border-stone-200 focus:border-pink-300 focus:ring-pink-300 rounded-xl"
          />
          <Button
            onClick={handleAdd}
            disabled={isAdding || !newName.trim()}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Ajouter
          </Button>
        </div>
      </div>

      {/* Flavors list */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Parfums ({flavors.length})
          </h3>
          <span className="text-xs text-gray-400">
            {flavors.filter(f => f.active).length} actifs
          </span>
        </div>

        {flavors.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Aucun parfum configuré.</p>
            <p className="text-sm mt-1">Ajoutez-en un ci-dessus.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {flavors.map((flavor, index) => (
              <li
                key={flavor.id}
                className={`flex items-center justify-between gap-3 px-6 py-4 transition-colors ${
                  !flavor.active ? "opacity-50 bg-stone-50" : "hover:bg-stone-50/50"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${flavor.active ? "bg-pink-400" : "bg-gray-300"}`} />
                  {editingId === flavor.id ? (
                    <div className="flex items-center gap-2 flex-1 max-w-xs">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(flavor)
                          if (e.key === "Escape") setEditingId(null)
                        }}
                        autoFocus
                        className="flex-1 px-3 py-1 text-sm font-medium rounded-lg border border-pink-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleRename(flavor)}
                        className="p-1.5 rounded-lg bg-pink-500 text-white hover:bg-pink-600"
                        title="Valider"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg bg-stone-100 text-gray-500 hover:bg-stone-200"
                        title="Annuler"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`font-medium truncate ${flavor.active ? "text-gray-900" : "text-gray-400 line-through"}`}>
                        {flavor.name}
                      </span>
                      {!flavor.active && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Désactivé</span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={loadingId !== null || index === 0}
                    title="Monter"
                    className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={loadingId !== null || index === flavors.length - 1}
                    title="Descendre"
                    className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  
                  <div className="w-px h-6 bg-gray-200 mx-1 md:mx-2" />

                  <button
                    onClick={() => {
                      setEditingId(flavor.id)
                      setEditValue(flavor.name)
                    }}
                    disabled={loadingId === flavor.id}
                    title="Renommer"
                    className="p-1.5 md:p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleToggle(flavor)}
                    disabled={loadingId === flavor.id}
                    title={flavor.active ? "Désactiver" : "Activer"}
                    className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    {loadingId === flavor.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : flavor.active ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(flavor)}
                    disabled={loadingId === flavor.id}
                    title="Supprimer"
                    className="p-1.5 md:p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Les parfums désactivés ne sont plus proposés aux clients, mais restent dans l&apos;historique des commandes existantes.
      </p>

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
                  Ce parfum sera définitivement supprimé. Vous pouvez aussi simplement le désactiver (icône œil) s&apos;il est temporairement indisponible.
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
