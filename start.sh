# Create a local .env with a random secret key on first run
if [ ! -f .env ]
then
    sed "s/^DJANGO_SECRET_KEY=.*/DJANGO_SECRET_KEY=$(openssl rand -hex 32)/" .env.example > .env
    echo "Created .env from .env.example"
fi

if [ "$1" == "clean" ]
then
    docker container prune -f 
    docker image prune -f
    docker compose build
fi

# Migrations are created by developers (python manage.py makemigrations) and committed;
# startup only applies them.
docker compose run web python manage.py migrate
docker compose up
