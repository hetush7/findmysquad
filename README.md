# F15-Group-3

## Our Team
- Corey Ackland : Project Manager 
- Aryan Bhatia : Primary Backend Developer/ Scrum Master 
- Ken Lim : Primary Frontend Developer
- Hetush Gupta : Developer 

## Stack Used
- **Backend:** Django
- **Database:** PostgreSQL 
- **Frontend:** React 18 (Vite, Node 20)
- **Container:** Docker
- **Deployment:** AWS (TODO)

## Instructions to Run
If you are on Windows then refer to the **For Windows** section before running these instructions!
<br>

**Step 1:** `git pull` this repo
<br>

**Step 2:** [Install Docker Engine](https://docs.docker.com/engine/install/)
<br>

**Step 3:** Open the docker engine on your local machine by clicking the icon 
<br>

**Step 4:** From the root project directory, run `docker compose build`
<br>

**Step 5:** Run `bash start.sh`. On the first run this creates a local `.env` file (from `.env.example`, with a random `DJANGO_SECRET_KEY`). Never commit `.env`.
<br>

**Step 6:** The server should have started. Visit [for-Mac](http://0.0.0.0:8000/api) or [for-Windows](http://127.0.0.1:8000/api) on your browser to check the backed server. Visit [localhost:3000](http://localhost:3000) to view the 
frontend in action. 
<br>

**Step 7:** Refer to Uploading Data section under Notes
<br>

Backend and frontend changes are picked up automatically while the server is running (the frontend uses Vite with hot reload).
If you change `frontend/package.json` (add or upgrade a dependency), rebuild with `bash start.sh clean`.

**WARNING:** With clean, this script will prune your other docker images and container. 

Whenever you wish to start development, make sure that the docker engine is opened on your local machine
before running `bash start.sh`.

## Notes (TO BE UPDATED AFTER DEPLOYMENT)
- Any dependencies that you would add using **pip** should simply be added to the requirements.txt file instead
- Admin Panel can be accessed here: [for-Mac](http://0.0.0.0:8000/admin) or [for-Windows](http://127.0.0.1:8000/admin) 
- Since the program is running locally right now, you would have to create a super user yourself: `docker compose run web python manage.py createsuperuser`
- Database migrations are not generated on startup. After changing `fms/models.py`, run `docker compose run web python manage.py makemigrations` and commit the new migration file.

### Uploading Data (For Testing)
When running locally, our application will have no games or forums. The admin/website maitainer is supposed to add these while testing. We made this process easier by including a json file that would load up **3 games and 3 forums**. To load this data, run the following command after Step 6:

`docker compose run web python manage.py loaddata test_data.json`
<br>

## Discord (optional)
To enable "Continue with Discord", gamer-tag import from Discord connections, and announcing rooms in a Discord channel:
1. Create an application at the [Discord Developer Portal](https://discord.com/developers/applications).
2. Under **OAuth2**, add the redirect URI `http://localhost:3000/discord-callback` (and your production URL, e.g. `https://your-domain/discord-callback`).
3. Put the client ID and secret in `.env` (`DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`).
4. Optional: create a channel webhook and set `DISCORD_LFG_WEBHOOK_URL`; hosts then get a "Post this room to the Discord LFG channel" checkbox.

Without these settings the Discord buttons are simply hidden.

## Deploying

The production stack is `docker-compose.prod.yml`: **nginx** serves the built React app and forwards `/api`, `/admin` and `/static` to **gunicorn** (Django), which talks to **PostgreSQL**. Everything is on one domain, so no CORS setup is needed.

1. On the server (for example an AWS EC2 instance with Docker installed), clone the repo.
2. Create the production settings and fill in every value (secret key, domain, database password):
   ```
   cp .env.prod.example .env.prod
   ```
3. Start it (migrations and static files run automatically on startup):
   ```
   docker compose -f docker-compose.prod.yml up -d --build
   ```
4. Create an admin user and load the games and forums:
   ```
   docker compose -f docker-compose.prod.yml exec web python manage.py createsuperuser
   docker compose -f docker-compose.prod.yml exec web python manage.py loaddata test_data.json
   ```
5. Put HTTPS in front of port 80, e.g. an AWS Application Load Balancer with an ACM certificate, and keep `DJANGO_HTTPS=1` in `.env.prod`.

Notes:
- `HTTP_PORT` changes the published port (default 80).
- To use a managed database (e.g. AWS RDS) instead of the `db` container, point `POSTGRES_HOST` and the other `POSTGRES_*` values at it and remove the `db` service.
- Back up the `postgres-data` volume (or use RDS snapshots).

## For Windows
- change docker-compose.yml file to:
```
version: "3.3"

services:
  db:
    image: postgres:13
    volumes:
      - postgres-vol:/var/lib/postgresql/data
    env_file: .env
    networks:
      - db

  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    env_file: .env
    volumes:
      - .:/code
    ports:
      - "8000:8000"
    links:
      - db:db
    depends_on:
      - db
    networks:
      - db

networks:
  db:
    driver: bridge

volumes:
  postgres-vol:
```
