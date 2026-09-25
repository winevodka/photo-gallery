# Photo Gallery (Google Drive powered)

MVP: read-only Album list → Gallery → Lightbox viewer, backed by metadata
synced from Google Drive folders into PostgreSQL. No authentication yet.

## Structure

- `backend/` — NestJS + TypeORM + PostgreSQL API. Syncs image metadata from
  Google Drive folders.
- `frontend/` — Next.js (App Router) + TailwindCSS UI.
- `docker-compose.yml` — local PostgreSQL for development.

## Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL) or an existing PostgreSQL instance
- A Google Cloud service account with the Google Drive API enabled, whose
  key file is downloaded as JSON. Share each Drive folder you want to sync
  with the service account's email address (read-only is enough).

## 1. Start PostgreSQL

```powershell
docker compose up -d
```

## 2. Backend setup

```powershell
cd backend
copy .env.example .env
# edit .env: set GOOGLE_SERVICE_ACCOUNT_KEY_PATH to your service account JSON
npm install
npm run start:dev
```

The API listens on `http://localhost:3001`.

### Add an album

```powershell
curl -X POST http://localhost:3001/albums `
  -H "Content-Type: application/json" `
  -d '{ "name": "Summer Trip 2026", "folderUrl": "https://drive.google.com/drive/folders/<FOLDER_ID>" }'
```

This creates the album and performs an initial sync. To re-sync later:

```powershell
curl -X POST http://localhost:3001/albums/<ALBUM_ID>/sync
```

## 3. Frontend setup

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000` to see the album list, click into an album for
the masonry gallery with infinite scroll, and click a photo to open the
lightbox viewer (arrow keys / Escape supported).

## API summary

| Method | Path                | Description                        |
| ------ | ------------------- | ----------------------------------- |
| GET    | `/albums`            | Paginated album list                |
| GET    | `/albums/:id`        | Album detail + paginated images     |
| POST   | `/albums`            | Create album from a Drive folder URL|
| POST   | `/albums/:id/sync`   | Re-sync album from Google Drive     |
| GET    | `/images/:id`        | Single image metadata               |

## Notes / next steps

This is the MVP scope only. Not yet implemented (see the original spec):
authentication, likes/comments/favorites, search & sort, share links,
resized downloads, tagging, admin portal, AI features. `synchronize: true`
in TypeORM is convenient for local development; replace with migrations
before deploying.
