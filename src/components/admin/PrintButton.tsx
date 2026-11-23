"use client"

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="mt-8 px-6 py-2 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 print:hidden shadow-lg transition-colors"
    >
      Imprimer / Enregistrer en PDF
    </button>
  )
}

