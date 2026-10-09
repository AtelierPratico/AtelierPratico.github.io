# PRATICO AI

PRATICO AI est la couche d’intelligence de la marque **Pratico — L’atelier du quotidien**.

## V1

- Assistant généraliste de la marque
- Mémoire de conversation en session
- Recherche locale dans une base de connaissances Pratico
- Réponses instantanées pour la conversation courante
- Moteur d’inférence local interchangeable
- Aucun compte utilisateur requis
- Aucun paiement demandé aux visiteurs
- Aucune clé API exposée dans le navigateur

## Architecture

Utilisateur → Interface Pratico → PRATICO AI → Recherche dans les connaissances → Construction du contexte → Moteur d’inférence → Réponse

Le modèle d’inférence n’est pas l’identité de PRATICO AI. Il peut être remplacé indépendamment par un autre modèle local, un serveur Pratico ou un fournisseur externe.

## Évolution prévue

1. Importer les tomes Pratico dans une vraie base de connaissances structurée.
2. Ajouter des citations vers les fiches et chapitres utilisés dans les réponses.
3. Ajouter un routeur par domaine : maison, cuisine, relations, animaux, organisation, etc.
4. Ajouter des outils Pratico : calculs, listes de matériel, recettes, checklists, diagnostics guidés.
5. Ajouter une mémoire utilisateur optionnelle côté navigateur.
6. Passer à un serveur d’inférence Pratico quand le trafic et le budget le justifieront.
7. Fine-tuner un modèle open source sur le style et les contenus Pratico si cela devient pertinent.

## Principe

La marque reste **PRATICO AI**. Les modèles open source utilisés dessous sont des composants techniques interchangeables, pas le produit final.
