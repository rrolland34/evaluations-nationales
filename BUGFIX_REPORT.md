# Investigation et corrections — 2 novembre 2026

Aucun commit, push ou déploiement effectué. Les modifications préexistantes dans `mon_site` ont été conservées.

## 1. Raccourci MAJ + Entrée

Cause confirmée dans les deux dépôts : après un clic sur Reprendre, le focus reste sur le bouton `#pause-timer`. Le gestionnaire commun ignore tout événement dont la cible se trouve dans un bouton. Le raccourci est donc rejeté avant l’appel au passage de question. Le moteur du chronomètre ne perd pas son callback à la reprise.

L’examen de `core/timer.js` confirme que Pause annule l’intervalle, conserve le temps et le callback, et incrémente la génération pour rendre les anciens ticks inoffensifs. Reprendre crée un seul intervalle. Aucun écouteur clavier n’est installé dans ces transitions.

Correction dans `core/keyboardShortcuts.js` : exception limitée au contrôle `#pause-timer`, lecture de l’état réel de pause avec `getIsPaused()`, conservation de `preventDefault()` pour éviter l’activation native du bouton. Les autres boutons, liens, champs éditables, événements répétés, compositions IME et combinaisons modifiées restent protégés. Entrée et les flèches conservent leur traitement existant. Aucun nouvel écouteur n’est ajouté aux reprises.

## 2. Diagnostic de l’export MathJax

**La cause exacte du blocage signalé sur GitHub Pages n’a pas pu être établie.** Il serait incorrect de présenter une panne réseau supposée comme une cause prouvée.

Le chargeur actuellement publié correspond au chargeur local initial : CDN `mathjax@3`, composition automatique attendue via `startup.promise`, limite de 15 secondes, désactivation de l’impression après échec, WeakSet empêchant une seconde tentative dans le même document.

Vérifications directes des versions publiées, sans les modifier ni imprimer :

- Chromium et Firefox ; `mon-site` et `evaluations-nationales` ; modes direct, QCM et mixte.
- Chaque document contient les 30 questions des six séries de remédiation, avec corrections.
- Les 12 exports ont terminé et autorisé l’impression. Aucune erreur MathJax ni police en échec détectée. Selon le mode, 613 à 656 conteneurs mathématiques composés.
- Un premier contrôle simple a également confirmé le téléchargement du script et des polices depuis jsDelivr, sans erreur réseau.

Défauts démontrés indépendamment :

1. Sous le serveur HTTP local avec préfixe de projet, le document `about:blank` construit immédiatement ne déclenche pas les requêtes des scripts externes dans le Chromium testé, même avec MathJax servi localement. Une vraie navigation vers une page du site permet le chargement. Cette observation dépend du contexte local ; elle ne prouve pas le même mécanisme sur le site HTTPS publié.
2. Une formule TeX aux accolades déséquilibrées peut être ignorée sans rejet de la promesse ni élément `mjx-merror`. Le chargeur initial pouvait alors autoriser une impression contenant du TeX brut. Un test avec le vrai MathJax reproduit ce cas.
3. La préparation initiale n’attend pas explicitement la fin du chargement des polices et des autres ressources du document. Son timeout est déjà borné, mais une panne impose de fermer la fenêtre et recommencer.

Aucun chemin manquant ou conflit entre deux versions n’a été observé dans les exports publiés testés. Chaque export dispose d’un contexte distinct du lecteur.

## 3. Préparation retenue

1. Ouverture synchrone d’une vraie page `core/export/exportShell.html`, afin de préserver l’ouverture depuis le geste utilisateur.
2. Attente de son signal de chargement via `postMessage`, en vérifiant l’origine et la fenêtre source. L’écouteur appartient à la fenêtre principale et survit aux navigations de nouvelle tentative. Limite : 15 secondes.
3. Construction du document, initialisation du contrôle d’impression, application des figures via `afterRender`. Dans le premier projet seulement, attente des figures Scratch lorsqu’elles sont présentes ; chaque ressource Scratch est bornée à 15 secondes.
4. Chargement de la distribution officielle **MathJax 3.2.2**, hébergée dans `assets/vendor/mathjax-3.2.2/`. Répertoire `es5` complet : 107 fichiers amont, environ 24 Mo, licence comprise. L’intégrité SHA-512 npm a été vérifiée ; les empreintes SHA-256 sont conservées dans `SHA256SUMS.json`.
5. Configuration explicite des chemins des composants et des polices depuis `import.meta.url`, conservant le préfixe GitHub Pages. Aucun repli CDN dans l’export. Le chargeur du lecteur reste inchangé.
6. `startup.typeset: false`, attente de `startup.promise`, puis un seul `typesetPromise([document.body])`. Ce séquencement suit les [options officielles de démarrage MathJax 3](https://docs.mathjax.org/en/v3.0/options/startup/startup.html).
7. Vérification des erreurs MathJax, du TeX restant non composé et du MathML restant hors du rendu accessible. Les blocs de code et les conteneurs MathJax sont exclus de la recherche de délimiteurs bruts.
8. Attente de `document.fonts.ready`, contrôle des polices en erreur et décodage des images. La phase MathJax et ressources dispose d’une limite globale de 20 secondes ; un délai fixe ne sert jamais de preuve de disponibilité.
9. Autorisation d’imprimer uniquement après succès, matérialisé par `data-export-ready`. Le gestionnaire de clic vérifie aussi cet état. Les styles d’impression masquent le sujet tant qu’il n’est pas prêt, y compris lors d’une impression native du navigateur.

En cas d’échec : message visible, impression désactivée, bouton Réessayer. La nouvelle tentative navigue dans la même fenêtre vers un **nouveau document**, puis reconstruit le contenu. Elle abandonne ainsi l’ancienne instance MathJax, sans empiler les scripts ni réutiliser une promesse en échec. Les résultats tardifs sont ignorés. Une WeakMap partage la même promesse si la préparation est demandée plusieurs fois pour le même document.

## 4. Fichiers concernés

Dans les deux dépôts :

- `core/keyboardShortcuts.js`.
- `core/export/exportWindow.js`, `exportDocument.js`, `exportMathJax.js`, `exportPrint.js`.
- Nouveau `core/export/exportShell.html`.
- Nouveaux fichiers `assets/vendor/mathjax-3.2.2/` : distribution, licence, provenance et empreintes.
- `tests/questionDuration.test.mjs` : cycles Pause/Reprendre et focus, trois positions de question.
- `tests/exportStyles.test.mjs` : adaptation de la simulation à la création asynchrone de la fenêtre ; assertions de contenu conservées.
- Nouveaux `tests/exportPreparation.test.mjs` et `tests/exportBrowser.test.mjs`.

Dans `mon_site` seulement : `core/export/exportScratchBlocks.js`, pour que le rendu Scratch fasse partie de la préparation de l’export. Aucun module Scratch, DNB ou autre composant supprimé n’a été ajouté à `evaluations-nationales`. Son assembleur `exportDocument.js` conserve sa chaîne allégée ; ses tests propres et ses styles n’ont pas été remplacés par ceux du premier dépôt.

`core/timer.js`, `main.js` et `exercise_player.html` n’ont pas été modifiés par cette correction. Le gestionnaire commun corrige les deux lecteurs du premier projet.

## 5. Tests et résultats

Suites complètes exécutées pendant l’intervention :

| Projet | Réussis | Échecs | Ignorés |
|---|---:|---:|---:|
| mon-site | 746 | 0 | 3 |
| evaluations-nationales | 158 | 0 | 3 |

Les trois tests ignorés correspondent aux deux groupes navigateur sans configuration Playwright et à l’ancien test PDF optionnel. Les nouveaux tests navigateur ont été exécutés séparément avec leurs dépendances configurées. Après ces suites complètes, deux contrôles supplémentaires ont été ajoutés au chargeur : empreintes des ressources et refus du TeX brut. Les **suites ciblées finales ont réussi 32/32 tests dans chaque dépôt**.

Matrice navigateur finale : Chromium **156.0.8078.79** et Firefox Playwright **153.0**, sous un serveur statique respectant strictement `/mon-site/` et `/evaluations-nationales/`. Les requêtes hors du site sont refusées dans les tests d’export. Les assertions vérifient l’absence de requête externe et de ressource introuvable en fonctionnement normal.

- Direct, QCM, mixte ; corrections, fractions et autres formules ; figures SVG ; plusieurs pages ; deux exports successifs dans la même session.
- Tableur réel du premier projet ; tableau de type tableur autonome pour le second, qui ne possède pas ce module.
- PDF réellement généré avec Chromium et nombre de pages contrôlé ; mise en page d’impression et visibilité vérifiées dans Firefox.
- Chargement ralenti ; script indisponible ; rejet de composition ; initialisation qui ne finit pas ; polices indisponibles ; nouvelle tentative dans le même onglet avec un document neuf.
- Formule TeX invalide : impression refusée même si MathJax ne rejette pas sa promesse.
- Figures Scratch attendues dans le premier projet seulement.
- Clics réels Pause/Reprendre conservant le focus, plusieurs questions et plusieurs cycles ; absence d’action pendant la pause et absence de saut double.
- Tests de session : MAJ + Entrée sans pause, quatre cycles sur chacune de trois questions, temps conservé, un seul intervalle après reprise, historique ajouté une seule fois, Entrée et flèches préservés.

Résultats navigateur : **mon-site 24/24 ; evaluations-nationales 22/22 ; aucun échec**.

Pour reproduire : `node --test tests/*.test.mjs`. Pour les navigateurs, installer Playwright, ses navigateurs, puis lancer `node --test tests/exportBrowser.test.mjs`. Les variables optionnelles sont `PLAYWRIGHT_MODULE`, `CHROMIUM_TEST_EXECUTABLE`, `FIREFOX_TEST_EXECUTABLE` et `PAGES_PREFIX`. Dans le second dépôt, définir `PAGES_PREFIX=/evaluations-nationales/`. Le délai raccourci du test de timeout s’applique seulement à la première tentative simulée ; la nouvelle tentative retrouve le délai normal.

## 6. Limites et contrôle après publication

Les changements restent locaux. **La version corrigée n’a pas été vérifiée sur GitHub Pages, puisqu’elle n’a pas été publiée.** Les essais des versions actuellement en ligne sont des diagnostics de l’ancien code, pas une validation des changements.

La panne de production signalée n’a pas été reproduite pendant les 12 essais complets. Pour en établir la cause exacte si elle réapparaît, il faut les erreurs réseau/console de la fenêtre d’export au moment du blocage, le navigateur et la série concernée. Aucun filtrage réseau propre à l’établissement n’a pu être reproduit.

Après une publication décidée par l’utilisateur, vérifier que `core/export/exportShell.html`, le script local, ses extensions et toutes les polices sont bien servis sous chaque préfixe. Rejouer les exports sur le poste et le réseau où le problème apparaissait, ainsi que Réessayer après une panne. L’impression PDF native de Firefox et la boîte de dialogue d’impression du système restent à vérifier manuellement : le test automatisé Firefox contrôle le rendu sous média `print` et l’appel au mécanisme d’impression.
