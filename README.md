# Uptime Monitor

Narzędzie do monitorowania dostępności serwisów HTTP. Cyklicznie sprawdza podane URLe i wysyła powiadomienie emailem gdy coś przestaje działać.

> 🚧 **W trakcie budowy** — projekt w fazie wczesnego developmentu.

## Demo

> Screenshot / GIF dashboardu pojawi się po ukończeniu frontendu.

## Funkcjonalności (planowane)

- Monitorowanie dowolnych endpointów HTTP/HTTPS
- Konfigurowalny interwał sprawdzania (per monitor)
- Powiadomienia email przy awarii i powrocie do działania
- Historia czasów odpowiedzi i dashboard statusów
- Autentykacja oparta na JWT

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Backend | FastAPI (Python) |
| Baza danych | PostgreSQL |
| Scheduler | APScheduler |
| Email | Mailgun |
| Frontend | React + Vite |
| Deploy | Railway (backend) + Vercel (frontend) |

## Struktura projektu

```
uptime-monitor/
├── backend/
│   ├── app/
│   │   ├── api/          # Handlery routów
│   │   ├── core/         # Konfiguracja, security, scheduler
│   │   ├── db/           # Sesja bazy danych
│   │   ├── models/       # Modele SQLAlchemy
│   │   ├── schemas/      # Schematy Pydantic
│   │   ├── services/     # Logika biznesowa
│   │   └── main.py
│   ├── alembic/          # Migracje bazy danych
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       └── hooks/
├── docker-compose.yml
└── README.md
```

## Uruchomienie lokalne

**Wymagania:** Python 3.11+, Docker

```bash
# 1. Sklonuj repo
git clone https://github.com/g0rzki/uptime-monitor.git
cd uptime-monitor

# 2. Uruchom bazę danych
docker compose up -d

# 3. Skonfiguruj backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# 4. Uruchom migracje
alembic upgrade head

# 5. Wystartuj API
uvicorn app.main:app --reload
```

API dostępne pod `http://localhost:8000`  
Swagger UI pod `http://localhost:8000/docs`

## Self-hosting

Działa na każdym VPS z Dockerem (minimum 512MB RAM, ARM64 lub x86).

## Roadmap

- [x] Setup projektu
- [x] Auth (rejestracja / login / JWT)
- [ ] Endpointy CRUD dla monitorów
- [ ] Scheduler — cykliczne sprawdzanie HTTP
- [ ] Powiadomienia email przez Mailgun
- [ ] Frontend React — dashboard i widok monitora
- [ ] Deploy na Railway + Vercel
