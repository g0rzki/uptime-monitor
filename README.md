# Uptime Monitor

> Narzędzie do monitorowania dostępności serwisów HTTP/HTTPS. Cyklicznie pinguje zdefiniowane URLe i wysyła powiadomienie emailem przy awarii lub powrocie do działania.

Projekt budowany jako samodzielne portfolio SaaS poza studiami — od zera, bez gotowych szablonów. Celem jest działający, publicznie dostępny produkt z realnym use-casem: własne konto, własne monitory, własne alerty.

---

## Demo

**Live:** https://monitor.gorzkiewicz.dev 
Konto demo: `demo@demo.com` / `demo1234`

---

## Co pokazuje ten projekt technicznie

- **Projektowanie REST API** — endpointy z autoryzacją JWT, walidacją danych wejściowych, obsługą błędów
- **Praca z bazą danych** — SQLAlchemy ORM, relacje między tabelami, migracje przez Alembic
- **Zadania w tle** — APScheduler uruchamiający cykliczne HTTP pingi bez zewnętrznych zależności (bez Celery)
- **Bezpieczeństwo** — rate limiting (slowapi), ochrona przed SSRF przy walidacji URL, limit zasobów per użytkownik
- **Integracja z zewnętrznym API** — Resend do wysyłki emaili z logiką anty-spam
- **Frontend SPA** — React + Vite, wykresy response time (Recharts), zarządzanie tokenem JWT
- **Deploy** — Railway (backend + managed PostgreSQL) + Vercel (frontend), automatyczny z GitHuba

---

## Funkcjonalności

- Monitorowanie dowolnych endpointów HTTP/HTTPS
- Konfigurowalny interwał sprawdzania (per monitor)
- Powiadomienia email przy awarii i powrocie do działania — jeden alert na incydent
- Historia czasów odpowiedzi z wykresem
- Dashboard z widokiem statusów wszystkich monitorów
- Autentykacja JWT z rate limitingiem na endpointach auth
- Ochrona przed SSRF i limit monitorów per konto (max 20)

---

## Stack

| Warstwa | Technologia |
|---|---|
| Backend | FastAPI (Python 3.14) |
| Baza danych | PostgreSQL 16 |
| Scheduler | APScheduler |
| Email | Resend |
| Frontend | React + Vite |
| Deploy | Railway + Vercel |

---

## Struktura projektu

```
uptime-monitor/
├── .env.example              # Szablon zmiennych środowiskowych
├── docker-compose.yml        # PostgreSQL do lokalnego devu
├── README.md
│
├── backend/
│   ├── alembic/              # Migracje bazy danych
│   │   └── versions/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py       # get_current_user — dependency injection
│   │   │   └── routes/
│   │   │       ├── auth.py
│   │   │       └── monitors.py
│   │   ├── core/
│   │   │   ├── config.py     # Ustawienia przez pydantic-settings
│   │   │   ├── scheduler.py  # APScheduler — cykliczne pingi
│   │   │   └── security.py   # JWT, bcrypt
│   │   ├── db/
│   │   │   ├── base.py       # DeclarativeBase
│   │   │   └── session.py    # get_db — dependency injection
│   │   ├── models/           # SQLAlchemy: User, Monitor, MonitorCheck, Alert
│   │   ├── schemas/          # Pydantic: walidacja requestów i responsów
│   │   ├── services/         # Logika biznesowa
│   │   └── main.py
│   ├── alembic.ini
│   ├── Dockerfile
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/              # Klienty HTTP (axios)
    │   ├── components/       # MonitorCard, StatusBadge, ResponseChart
    │   ├── hooks/            # useAuth
    │   ├── pages/            # Login, Register, Dashboard, MonitorDetail
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js        # Proxy /api -> localhost:8000
```

---

## Uruchomienie lokalne

**Wymagania:** Python 3.14+, Node.js 18+, Docker

```bash
# 1. Sklonuj repo
git clone https://github.com/g0rzki/uptime-monitor.git
cd uptime-monitor

# 2. Uzupełnij zmienne środowiskowe
cp .env.example .env
# Wygeneruj SECRET_KEY: openssl rand -hex 32

# 3. Uruchom bazę danych
docker compose up -d

# 4. Skonfiguruj backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 5. Uruchom migracje
alembic upgrade head

# 6. Wystartuj API
uvicorn app.main:app --reload
```

W osobnym terminalu:

```bash
# 7. Uruchom frontend
cd frontend
npm install
npm run dev
```

API: `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`  
Frontend: `http://localhost:5173`

---

## Zmienne środowiskowe

```env
DATABASE_URL=postgresql://admin:admin@localhost:5432/uptimedb
SECRET_KEY=             # openssl rand -hex 32
RESEND_API_KEY=         # resend.com — darmowy tier, wymagane do alertów
MAIL_FROM=onboarding@resend.dev
```

---

## Roadmap

- [x] Setup projektu, struktura, Docker
- [x] Modele bazy danych + migracje Alembic
- [x] Auth — rejestracja, login, JWT, rate limiting
- [x] CRUD monitorów + walidacja URL (SSRF) + limit per konto
- [x] Scheduler — cykliczne sprawdzanie HTTP, wykrywanie awarii
- [x] Powiadomienia email przez Resend
- [x] Frontend React — dashboard, wykresy
- [x] Deploy Railway + Vercel