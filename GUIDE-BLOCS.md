# Développer des blocs Odoo 18 — Fikra Digital

## 1. Installer Docker Desktop

Télécharger sur docker.com, installer, redémarrer le PC. Docker Desktop
activera WSL2 tout seul si nécessaire.

Vérifier dans PowerShell :
```powershell
docker --version
```

## 2. Récupérer le projet

Décompresser l'archive dans un dossier de travail, par exemple
`C:\Users\<toi>\dev\fikra-odoo-dev`.

```powershell
cd C:\Users\<toi>\dev\fikra-odoo-dev
docker compose up -d
```

Le premier démarrage télécharge Odoo 18 (3 Go). Ensuite c'est instantané.

## 3. Créer la base de développement

Ouvrir `http://localhost:8069`. Odoo affiche le gestionnaire de bases.

- Master Password : `dev`
- Database Name : **`dev`** (impératif — le `--db-filter` du compose l'exige)
- Email : `admin` | Password : `admin`
- Langue : Français | Pays : Niger
- **Ne pas cocher** les données de démonstration

## 4. Installer le module

1. Applications → menu ⋮ → **Mettre à jour la liste des applications**
2. Retirer le filtre « Applications » de la barre de recherche
3. Chercher `Fikra Blocks` → Activer

Le module dépend de `website`, qui s'installera automatiquement.

## 5. Voir le bloc

Site web → Nouveau → une page → **Éditer** → panneau de gauche → section
**Structure** → le bloc « Bandeau défilant » est en bas de la liste.

Glisse-le sur la page. Sélectionne-le : le panneau de droite propose vitesse,
sens, style et pause au survol.

## 6. La boucle de développement

C'est tout l'intérêt du local. Modifie
`addons/theme_fikra_blocks/static/src/scss/s_fikra_marquee.scss`, enregistre,
recharge la page : le changement est là. Pas de redémarrage, pas de mise à
jour de module.

**Deux exceptions** où il faut mettre à jour le module :

- ajout d'un **nouveau fichier** dans `data` ou `assets` du manifeste
- modification du **manifeste** lui-même

```powershell
docker compose exec odoo odoo -d dev -u theme_fikra_blocks --stop-after-init
docker compose restart odoo
```

Pour les modifications de XML seules, `--dev=all` recharge à chaud — mais si
un changement ne s'applique pas, la mise à jour ci-dessus règle toujours le
problème.

## 7. Mettre sur GitHub

Créer un dépôt **privé** `fikra-odoo-addons` sur github.com, sans README.

```powershell
git init
git add .
git commit -m "Environnement de dev + premier snippet : bandeau défilant"
git branch -M main
git remote add origin https://github.com/<ton-compte>/fikra-odoo-addons.git
git push -u origin main
```

Ensuite, à chaque session de travail :
```powershell
git add .
git commit -m "Ajout du bloc compteurs animés"
git push
```

**Prends l'habitude de committer souvent.** Un commit par bloc terminé, au
minimum. C'est ce qui te protège de la perte de travail.

---

## Si le xpath échoue à l'installation

Le fichier `views/snippets/snippets.xml` s'accroche au panneau de l'éditeur
via un xpath. Si Odoo 18 a renommé le groupe, l'installation échoue avec
« Element ... cannot be located in parent view ».

Pour voir la structure réelle de ta version :

```powershell
docker compose exec odoo grep -n "snippets id=" /usr/lib/python3/dist-packages/odoo/addons/website/views/snippets/snippets.xml
```

La sortie liste les identifiants disponibles (`snippet_structure`,
`snippet_content`, `snippet_groups`...). Remplace `snippet_structure` dans le
xpath par celui qui correspond, et relance l'installation.

---

## Anatomie d'un snippet

Quatre fichiers, toujours les mêmes :

| Fichier | Rôle |
|---|---|
| `views/snippets/s_xxx.xml` | le HTML du bloc, en QWeb |
| `views/snippets/snippets.xml` | l'ajoute au panneau de l'éditeur |
| `views/snippets/options.xml` | les réglages du panneau de droite |
| `static/src/scss/s_xxx.scss` | le style |

Pour créer un second bloc : dupliquer ces quatre fichiers, renommer, déclarer
le nouveau XML dans `data` et le nouveau SCSS dans `assets` du manifeste,
mettre à jour le module.

**Conventions à respecter** — elles évitent les collisions avec Odoo et avec
tes futurs blocs : préfixe `s_fikra_` pour les identifiants et les classes,
un fichier SCSS par bloc, et jamais de style qui déborde du sélecteur racine
du bloc.

---

## Les options de l'éditeur

Tant qu'une option se traduit par une classe CSS, aucun JavaScript n'est
nécessaire — c'est le cas de toutes celles du marquee.

- `<we-select>` + `data-select-class` : choix exclusif entre plusieurs classes
- `<we-checkbox>` + `data-select-class` : ajoute ou retire une classe
- `<we-input>` + `data-select-style` : valeur libre (taille, couleur)

Le JavaScript ne devient nécessaire que pour un comportement dynamique réel —
un carrousel piloté par Swiper, un compteur qui s'anime à l'entrée dans le
viewport.

---

## Prochains blocs, par ordre de difficulté

**Sans JavaScript** — commence par là :
grille tarifaire, cartes avec effet de survol, timeline verticale, bloc de
statistiques, bandeau d'appel à l'action en dégradé, comparateur avant/après.

**Avec une bibliothèque externe** (Swiper, AOS, CountUp — toutes en MIT) :
carrousel de témoignages, apparitions au scroll, compteurs animés, galerie
avec filtres, carrousel de logos.

Une bibliothèque externe se dépose dans `static/lib/<nom>/` et se déclare
dans `assets` du manifeste, avant ton propre SCSS et JS.

---

## Déployer chez un client

Une fois un bloc validé en local :

1. `git push` depuis ton PC
2. Sur le VPS, le code doit arriver dans le volume `<projet>_odoo-addons`
3. Installer avec le template Portainer « Odoo 18 — Installer un module »,
   `ACTION = -i`, `MODULES = theme_fikra_blocks`

L'étape 2 demande d'ajouter un service `git clone` au template de stack — on
le fera quand tu auras un premier bloc prêt à livrer. Inutile de compliquer
l'infrastructure avant.

**Ne teste jamais directement chez un client.** `test_lock` existe pour ça.
