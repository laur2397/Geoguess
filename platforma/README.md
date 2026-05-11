# Platformă de centralizare a resurselor cadrelor didactice

Platformă web pentru **Școala Gimnazială Greceşti**, conformă cu cerințele caietului de sarcini (CPV 72262000-9 – Servicii de dezvoltare software).

## Scop

Centralizarea resurselor didactice, accesul elevilor la materiale, gestionarea temelor și monitorizarea progresului — într-o singură platformă web sigură, responsive și ușor de folosit.

## Conformitate cu caietul de sarcini

| Cerință | Implementare |
|---|---|
| Centralizare și management resurse | Upload, clasificare pe materii/clase/tipuri, etichete, vizibilitate granulară |
| Acces pentru elevi | Vizualizare resurse filtrate pe clasă, descărcare, predare teme |
| Monitorizarea progresului elevilor | Dashboard pentru elev (medii, predări), vedere de clasă pentru profesori |
| Integrare video | Player video integrat cu suport Range Requests (streaming) |
| Interfață customizabilă | Setări admin: nume școală, culoare temă, logo, email contact |
| Securitate și protecția datelor | JWT, bcrypt (10 rounds), helmet, rate limiting, audit log, GDPR-ready |
| Accesibilitate multi-dispozitiv | Layout responsive (PC, tabletă, smartphone) |
| Capacitate de scalare | SQLite WAL (poate migra la PostgreSQL), arhitectură stateless API |
| Compatibilitate | API REST standard, integrare cu echipamente prin browser modern |
| Uptime 99.5% | Aplicație Node.js compatibilă cu PM2/Docker/systemd |
| Timp răspuns < 3s | Index-uri SQL, cache static, build optimizat Vite |

## Arhitectură tehnică

```
┌────────────────────────────────────────────────────┐
│  Browser (PC / tabletă / smartphone)               │
│  Vue 3 + Vue Router + Pinia + Vite                 │
└──────────────────────┬─────────────────────────────┘
                       │ HTTPS / JSON / multipart
                       ▼
┌────────────────────────────────────────────────────┐
│  Node.js + Express                                 │
│  ├─ JWT auth · bcrypt · helmet · rate limit        │
│  ├─ Multer (upload, 200 MB max)                    │
│  ├─ Range streaming pentru video                   │
│  └─ Audit log (GDPR)                               │
└──────────────────────┬─────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
       SQLite (WAL)        Filesystem
       date utilizatori,   fișiere
       teme, note          uploaduri
```

## Roluri

- **Administrator** — gestionează utilizatori, setări platformă, vede jurnalul de activitate
- **Profesor** — încarcă resurse, creează teme, evaluează predările, monitorizează clase
- **Elev** — accesează resurse, predă teme, vede notele și feedback-ul

## Instalare locală

```bash
# 1. Instalează dependențele (backend + frontend)
cd platforma
npm install
cd client && npm install && cd ..

# 2. Configurare
cp .env.example .env
# editați .env și schimbați JWT_SECRET

# 3. Creează conturi demo (opțional)
npm run seed

# 4. Pornire (dezvoltare)
# terminal 1 – backend pe :3000
npm run dev
# terminal 2 – frontend pe :5173 (proxy către :3000)
npm run dev:client
```

Deschideți http://localhost:5173 în browser.

## Build pentru producție

```bash
# Build frontend (output: client/dist/)
npm run build:client

# Pornește serverul (servește și API, și frontend-ul build-uit)
NODE_ENV=production node server/index.js
```

În producție, plasați aplicația în spatele unui reverse-proxy (nginx/caddy) cu TLS.

## Conturi demo (după `npm run seed`)

| Rol | Email | Parolă |
|---|---|---|
| Administrator | `admin@scoala.local` | `admin1234` |
| Profesor | `profesor@scoala.local` | `profesor1234` |
| Elev (V A) | `elev@scoala.local` | `elev1234` |
| Elev (V A) | `elev2@scoala.local` | `elev1234` |
| Elev (VI B) | `elev3@scoala.local` | `elev1234` |

**Schimbați aceste parole imediat după prima conectare în producție.**

## Variabile de mediu (`.env`)

```
PORT=3000
NODE_ENV=production
JWT_SECRET=...                 # OBLIGATORIU în producție — minim 32 caractere
JWT_EXPIRES_IN=7d
DB_PATH=./data/platforma.db
UPLOADS_DIR=./server/uploads
MAX_UPLOAD_SIZE_MB=200
CORS_ORIGIN=https://platforma.scoalagrecesti.ro
```

## API REST – endpoint-uri principale

### Autentificare
- `POST /api/auth/register` — înregistrare profesor/elev
- `POST /api/auth/login` — autentificare → JWT
- `GET  /api/auth/me` — utilizator curent
- `POST /api/auth/change-password` — schimbare parolă

### Utilizatori (admin/profesor)
- `GET  /api/users` — listare
- `POST /api/users` — creare (admin)
- `PUT  /api/users/:id` — modificare
- `DELETE /api/users/:id` — ștergere (admin)
- `GET  /api/users/classes` — lista claselor

### Resurse didactice
- `GET  /api/resources` — listare (filtrată după rol)
- `POST /api/resources` — încărcare (profesor/admin, multipart)
- `GET  /api/resources/:id` — detalii
- `PUT  /api/resources/:id` — modificare
- `DELETE /api/resources/:id` — ștergere
- `GET  /api/resources/:id/download` — descărcare fișier
- `GET  /api/resources/:id/stream` — streaming (video/PDF) cu Range
- `GET  /api/resources/subjects` — materii
- `POST /api/resources/subjects` — adăugare materie

### Teme
- `GET  /api/homework` — listare
- `POST /api/homework` — creare (profesor)
- `GET  /api/homework/:id` — detalii + predări
- `DELETE /api/homework/:id` — ștergere
- `POST /api/homework/:id/submit` — predare (elev, multipart)
- `POST /api/homework/submissions/:id/grade` — notare
- `GET  /api/homework/submissions/:id/download` — descărcare predare
- `GET  /api/homework/attachments/:id/download` — descărcare atașament temă

### Progres
- `GET  /api/progress/me` — progres elev curent
- `GET  /api/progress/student/:id` — progres elev (profesor/admin)
- `GET  /api/progress/class/:class_name` — progres clasă
- `GET  /api/progress/overview` — statistici globale

### Setări
- `GET  /api/settings` — public
- `PUT  /api/settings` — modificare (admin)
- `GET  /api/settings/activity` — audit log (admin)

## Securitate (conform GDPR & caiet de sarcini)

- **Parole**: hashing bcrypt cu 10 rounds, minim 8 caractere
- **Autentificare**: JWT cu expirare (default 7 zile)
- **Authorization**: control de acces bazat pe rol pe fiecare rută
- **Rate limiting**: 30 req/15min pe `/auth`, 300 req/min pe restul `/api`
- **Helmet**: header-e HTTP de securitate (CSP, HSTS, X-Frame-Options etc.)
- **Audit log**: înregistrează login-uri, modificări de date, descărcări
- **Upload sigur**: whitelist de extensii, limită de mărime, redenumire criptografică
- **SQL injection**: prepared statements peste tot (better-sqlite3)
- **CORS**: configurabil prin variabilă de mediu

### Pași de hardening în producție

1. Setați `JWT_SECRET` la o valoare aleatorie de minim 32 de caractere
2. Restricționați `CORS_ORIGIN` la domeniul real
3. Folosiți HTTPS (reverse proxy nginx/caddy + Let's Encrypt)
4. Backup zilnic al folderului `data/` și `server/uploads/`
5. Configurați monitorizare (uptime, logs, alerting)
6. Aplicați politici Linux de file permissions pe folderul `uploads`

## Performanță & scalabilitate

- **SQLite WAL mode** via `node:sqlite` (built-in, fără compilare nativă) — suportă mii de citiri simultane; potrivit pentru ~50-500 utilizatori
- **Index-uri**: pe `subject_id`, `class_name`, `student_id`, `homework_id`
- **Vite build** cu code-splitting per rută — bundle inițial < 50 kB gzip
- **Range Requests** pentru streaming video fără a încărca tot fișierul
- **Migrare la PostgreSQL**: schimbați doar `db.js` (queries-urile sunt SQL standard)

## Plan de implementare (5 luni conform caiet)

| Lună | Activitate |
|---|---|
| 1 | Analiză detaliată cu școala, configurare infrastructură, training inițial |
| 2 | Personalizare interfață, import utilizatori, configurare clase și materii |
| 3 | Testare pilot cu un grup de profesori și elevi; ajustări |
| 4 | Lansare completă, training cadre didactice, documentație |
| 5 | Monitorizare, suport post-lansare, optimizări, recepție finală |

## Suport tehnic & sustenabilitate

- Documentație de utilizare (acest README + manualul utilizatorilor)
- Mecanism de jurnalizare pentru diagnostic
- Cod open-source MIT — fără cost de licențiere ulterior
- Migrare ușoară (date SQLite portabil, fișiere pe disc)

## Stack tehnologic

**Frontend**: Vue 3, Vue Router, Pinia, Vite — modern, reactiv, fără dependențe enterprise.

**Backend**: Node.js 22.5+ (folosește modulul built-in `node:sqlite` — fără compilare nativă), Express 4, JSON Web Tokens, bcryptjs, multer, helmet, express-rate-limit.

**Bază de date**: SQLite (WAL) — zero-config, fișier portabil; poate fi migrată la PostgreSQL/MySQL fără modificarea schemei aplicației.

## Licență

Cod livrat sub licența MIT (vezi `../LICENSE`).
