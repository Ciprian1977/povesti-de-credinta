# Configurare Notificări Push — Povești de Credință

Acest document explică pașii finali pentru activarea **Modulului de Notificări Inteligente** (Panoul de Setări Duhovnicești de la `/setari-notificari`).

Tot codul este deja implementat și funcțional. Mai rămâne un singur lucru: **înlocuirea App ID-ului OneSignal** (un placeholder) cu cel real din contul tău.

---

## Pasul 1 — Obține credențialele din OneSignal

1. Intră în [OneSignal Dashboard](https://dashboard.onesignal.com/) → aplicația ta (sau creează una nouă de tip **Web Push**).
2. Mergi la **Settings → Keys & IDs**.
3. Notează:
   - **OneSignal App ID** (format UUID, ex: `1a2b3c4d-5e6f-7890-abcd-ef1234567890`) — *cheie publică, merge în frontend*.
   - **REST API Key** — *cheie secretă, merge DOAR în GitHub Secrets*.

> La configurarea aplicației Web Push în OneSignal, setează **Site URL** la `https://povestidecredinta.ro`.

---

## Pasul 2 — Înlocuiește App ID-ul în frontend

Deschide fișierul **`js/app.js`** și înlocuiește placeholder-ul de la linia ~15:

```js
const ONESIGNAL_APP_ID = 'ONESIGNAL_APP_ID_PLACEHOLDER';
```

cu App ID-ul real:

```js
const ONESIGNAL_APP_ID = '1a2b3c4d-5e6f-7890-abcd-ef1234567890';
```

Variabila `ONESIGNAL_CONFIGURAT` (linia următoare) se activează **automat** odată ce App ID-ul are formatul corect de UUID — nu trebuie să modifici nimic altceva.

După modificare, regenerează bundle-ul minificat:

```bash
node_modules/.bin/terser js/app.js -c -m -o js/min/app.min.js
```

(sau spune-mi mie și îl regenerez eu.)

---

## Pasul 3 — Adaugă secretele în GitHub (pentru notificările automate)

În repo → **Settings → Secrets and variables → Actions → New repository secret**, adaugă:

| Nume secret           | Valoare                                  |
|-----------------------|------------------------------------------|
| `ONESIGNAL_APP_ID`    | App ID-ul (UUID)                         |
| `ONESIGNAL_API_KEY`   | REST API Key (secretă)                   |

Secretele `SUPABASE_URL` și `SUPABASE_SERVICE_KEY` există deja.

---

## Cum funcționează

### Frontend (`/setari-notificari`)
- 4 comutatoare: **Gândul de dimineață**, **Rugăciunea de prânz**, **Rugăciunea de seară** (cu oră reglabilă) și **Alerte posturi/sărbători**.
- La **primul** comutator activat, browserul cere permisiunea nativă de notificări.
- Preferințele se salvează în `localStorage` (cheia `pdc_notificari_v1`) și se sincronizează cu OneSignal prin **Tags**:
  - `dimineata`, `pranz`, `seara`, `alerte_post` → `"true"` / `"false"`
  - `seara_ora` → ora aleasă (ex: `"21:30"`)

### Backend (GitHub Actions — `.github/workflows/notificari.yml`)
Trimite notificări **segmentate** (doar către cei care au activat fiecare opțiune), folosind filtre pe Tags:

| Segment       | Oră (RO, vara) | Cron (UTC)      |
|---------------|----------------|-----------------|
| `dimineata`   | 07:30          | `30 4 * * *`    |
| `pranz`       | 13:00          | `0 10 * * *`    |
| `seara`       | 21:30          | `30 18 * * *`   |
| `alerte_post` | manual/la nevoie | `workflow_dispatch` |

Trimitere manuală (ex. o alertă de post): repo → **Actions → Notificari Push Segmentate → Run workflow** → alege segmentul.

Sau din linia de comandă (cu secretele setate ca variabile de mediu):

```bash
cd scripts
node trimite-notificari.js alerte_post 2026-06-24
```

> **Notă fus orar:** cron-urile sunt în UTC și calibrate pentru ora de vară a României (UTC+3). Iarna (UTC+2) notificările vor sosi cu o oră mai devreme. Dacă vrei precizie tot anul, ajustează cron-urile la trecerea la ora de iarnă sau spune-mi să adaug o logică de compensare.

---

## Verificare rapidă

1. Deschide `https://povestidecredinta.ro/setari-notificari`.
2. Activează un comutator → acceptă permisiunea → ar trebui să apară badge-ul **„🔔 Notificări activate"**.
3. În OneSignal Dashboard → **Audience → Subscriptions**, ar trebui să-ți vezi dispozitivul cu Tag-urile setate.
4. Trimite manual un test din **Actions → Run workflow → segment: dimineata**.

Gata — modulul este complet și pregătit pentru cele câteva mii de suflete care au instalat deja aplicația.
