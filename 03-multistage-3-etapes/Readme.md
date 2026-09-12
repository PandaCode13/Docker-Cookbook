# Cas 03 — Multi-stage (3+ étapes : deps → build → test → runtime)

## Quand utiliser ce pattern

Quand tu veux que **les tests fassent partie intégrante du build** de l'image, pas d'une étape CI séparée et facultative. Typique pour :
- Un projet TypeScript où on veut compiler ET valider avant de produire l'image finale
- Une équipe qui veut garantir qu'aucune image ne peut être poussée sur un registre si les tests échouent
- Séparer clairement les responsabilités : `deps` (installation), `build` (compilation), `test` (validation), `runtime` (exécution finale)

**Différence avec le cas 02** : ici on ajoute une étape `test` intercalée entre le build et le runtime. Si un test échoue, la commande `RUN npm test` retourne un code d'erreur non-nul, ce qui **stoppe tout le build Docker** — impossible de continuer vers l'étape `runtime`.

## Commande pour tester

### Windows (PowerShell)

```powershell
cd 03-multistage-3-etapes

docker build -t cas03-multistage-tests .

docker run -p 3000:3000 cas03-multistage-tests
```

### Linux / Mac

```bash
cd 03-multistage-3-etapes

docker build -t cas03-multistage-tests .

docker run -p 3000:3000 cas03-multistage-tests
```

Puis ouvrir `http://localhost:3000` — tu dois voir un JSON avec `exempleCalcul: 5` (testé et confirmé fonctionnel).

## Vérifier que les tests bloquent bien le build

Essaie volontairement de casser un test dans `test/math.test.ts` (par exemple change `assert.strictEqual(add(2, 3), 5)` en `assert.strictEqual(add(2, 3), 999)`), puis relance `docker build`. Tu dois voir le build échouer à l'étape `test`, avec le détail de l'échec du test affiché dans les logs.

## Cibler une étape précise (aperçu du cas 04)

Tu peux aussi builder uniquement jusqu'à l'étape `test`, sans aller jusqu'au runtime, avec :

```bash
docker build --target test -t cas03-tests-only .
```

Utile en CI si tu veux juste valider le code sans produire l'image finale. (On détaillera ce mécanisme en profondeur dans le cas 04 — multi-stage avec `--target`.)

## Pièges fréquents

- **`rootDir` de TypeScript qui décale la sortie** : avec `src/` et `test/` comme dossiers sources, `tsc` compile dans `dist/src/` et `dist/test/` (et non directement dans `dist/`). Le `main` du `package.json` et le `CMD` du Dockerfile pointent donc vers `dist/src/server.js`, pas `dist/server.js`. Vérifie toujours la structure réelle de `dist/` après un premier build (`ls dist`) avant de fixer ces chemins.
- **`node --test` sur un dossier ou un glob, plutôt qu'un fichier précis** : la découverte automatique de fichiers de test par Node (`node --test dossier/`, `node --test "**/*.test.js"`) s'est révélée peu fiable et incohérente selon la version de Node (fonctionne en local, échoue dans l'image `node:20-alpine`, ou l'inverse). La solution la plus robuste : cibler explicitement le chemin du fichier compilé, ex. `node --test dist/test/math.test.js`. Moins pratique si tu as beaucoup de fichiers de test, mais fiable partout — pour plusieurs fichiers, liste-les tous explicitement ou passe par un vrai runner (Jest, Vitest) plutôt que le test runner intégré de Node.
- **Utiliser `--from=build` au lieu de `--from=test`** dans l'étape runtime : ça copierait le résultat du build sans garantir que les tests sont passés (puisque Docker exécute les étapes dans l'ordre de leurs dépendances — si `runtime` ne dépend que de `build`, l'étape `test` pourrait ne jamais être exécutée). Toujours faire dépendre `runtime` de `test` pour forcer l'exécution des tests.
- **Oublier que `npm test` doit retourner un code de sortie non-nul en cas d'échec** : certains scripts de test mal configurés retournent toujours 0, ce qui rendrait cette protection inutile. Vérifie que ton runner de test (ici le test runner intégré à Node) échoue bien correctement.
- **Copier `test/` dans l'image finale par erreur** : ici on copie uniquement `dist` généré par le build, mais si tu changes la structure, assure-toi que les fichiers de test ne finissent pas dans l'image de production.
- **Builds lents car `deps` n'est pas réutilisé correctement** : si le `Dockerfile` ne structure pas bien les étapes (ex: copier tout le code avant `npm install`), Docker invalide le cache à chaque changement de code, même minime.