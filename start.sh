if [ "$1" == "clean" ]
then
    docker container prune -f 
    docker image prune -f
    docker-compose build
fi

docker-compose run web python manage.py makemigrations
docker-compose run web python manage.py migrate
docker-compose up
