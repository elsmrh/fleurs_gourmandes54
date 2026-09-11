export default function CGVPage() {
  return (
    <div className="flex flex-col min-h-screen pt-32 pb-20 bg-[#FDFBF9] selection:bg-pink-200">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <span className="text-pink-400 uppercase tracking-[0.4em] text-xs font-bold block mb-6">Conditions Générales</span>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Conditions Générales de Vente</h1>
          <div className="w-16 h-px bg-pink-300 mx-auto" />
        </div>

        <div className="prose prose-stone prose-p:font-light prose-p:leading-relaxed max-w-none">
          <p className="text-gray-500 mb-10 text-center italic">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre <strong>Fleurs Gourmandes 54</strong> et toute personne physique ou morale (ci-après "le Client") souhaitant procéder à une commande via le site internet ou par tout autre moyen de communication.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">2. Produits</h2>
          <p>
            Fleurs Gourmandes 54 propose à la vente des créations pâtissières sur mesure, notamment des bouquets de cupcakes floraux. S'agissant de produits artisanaux, chaque création est unique. Les photographies illustrant les produits ne sont pas contractuelles.
          </p>
          <p>
            Nos produits contiennent des allergènes (gluten, œufs, lait, fruits à coque...). Il appartient au Client de nous signaler toute allergie lors de la prise de commande.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">3. Commandes et Délais</h2>
          <p>
            Toute commande doit être passée avec un délai minimum de <strong>48 heures</strong> à l'avance, sous réserve de disponibilité dans le planning.
          </p>
          <p>
            La commande n'est définitivement confirmée qu'après acceptation par Fleurs Gourmandes 54 et réception d'un acompte ou du règlement total (selon les modalités convenues lors de la réservation).
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">4. Prix et Modalités de paiement</h2>
          <p>
            Les prix de nos bouquets sont indiqués en euros (€) TTC. Fleurs Gourmandes 54 se réserve le droit de modifier ses prix à tout moment, étant toutefois entendu que le prix figurant au catalogue le jour de la commande sera le seul applicable au Client.
          </p>
          <p>
            Le règlement s'effectue au moment du retrait de la commande (espèces, carte bancaire, etc.) sauf accord spécifique pour un acompte en ligne.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">5. Retrait et Conservation</h2>
          <p>
            Les commandes sont à retirer sur rendez-vous à [Ville/Adresse de retrait]. Le Client s'engage à respecter l'horaire convenu. En cas de retard, merci de prévenir dans les plus brefs délais.
          </p>
          <p>
            Dès la remise de la commande, le Client assume l'entière responsabilité de son transport et de sa conservation. Nos pâtisseries doivent être conservées selon les indications données lors du retrait (généralement au frais) et consommées dans les délais recommandés.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">6. Annulation et Modification</h2>
          <p>
            S'agissant de denrées périssables et de commandes sur mesure, le droit de rétractation ne s'applique pas (Article L221-28 du Code de la consommation).
          </p>
          <p>
            Toute annulation ou modification de commande de la part du Client doit être demandée au moins 48 heures à l'avance. Passé ce délai, l'acompte versé sera conservé à titre de dédommagement, ou la totalité de la commande pourra être facturée.
          </p>
        </div>
      </div>
    </div>
  );
}

