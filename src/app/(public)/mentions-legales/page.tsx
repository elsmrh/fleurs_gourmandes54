export default function MentionsLegalesPage() {
  return (
    <div className="flex flex-col min-h-screen pt-32 pb-20 bg-[#FDFBF9] selection:bg-pink-200">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <span className="text-pink-400 uppercase tracking-[0.4em] text-xs font-bold block mb-6">Informations Légales</span>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Mentions Légales</h1>
          <div className="w-16 h-px bg-pink-300 mx-auto" />
        </div>

        <div className="prose prose-stone prose-p:font-light prose-p:leading-relaxed max-w-none">
          <p className="text-gray-500 mb-10 text-center italic">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">1. Éditeur du site</h2>
          <p>
            Le site <strong>Fleurs Gourmandes 54</strong> est édité par Kamélia [Nom de famille], auto-entrepreneur (ou société).<br/>
            Siège social : [Adresse complète]<br/>
            SIRET : [Numéro SIRET]<br/>
            Email : [Adresse email de contact]<br/>
            Téléphone : [Numéro de téléphone]
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">2. Création et Développement</h2>
          <p>
            Le design et le développement du site ont été réalisés par :<br/>
            <strong>HOMIKA Studio</strong><br/>
            Site web : <a href="https://homika-studio.com/" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600">homika-studio.com</a>
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">3. Hébergement</h2>
          <p>
            Ce site est hébergé par :<br/>
            <strong>OVH SAS</strong><br/>
            2 rue Kellermann<br/>
            59100 Roubaix, France<br/>
            Site web : <a href="https://www.ovhcloud.com/fr/" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600">ovhcloud.com</a>
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">4. Propriété intellectuelle</h2>
          <p>
            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
          <p>
            La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
          </p>

          <h2 className="text-2xl font-serif text-gray-900 mt-12 mb-4">5. Données personnelles</h2>
          <p>
            D'une façon générale, vous pouvez visiter notre site sur Internet sans avoir à décliner votre identité et à fournir des informations personnelles vous concernant. Cependant, nous pouvons parfois vous demander des informations (notamment lors d'une demande de réservation ou de contact) pour traiter votre demande.
          </p>
        </div>
      </div>
    </div>
  );
}

