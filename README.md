# F15-Group-3

## Our Team
- Corey Ackland : Project Manager 
- Aryan Bhatia : Primary Backend Developer/ Scrum Master 
- Ken Lim : Primary Frontend Developer
- Hetush Gupta : Developer 

## Stack Used
- **Backend:** Django
- **Database:** PostgreSQL 
- **Frontend:** React
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

**Step 4:** From the root project directory, run `docker-compose build`
<br>

**Step 5:** Run `bash start.sh`. You might have to run this twice as, in the first go, the data base will be established for connections
<br>

**Step 6:** The server should have started. Visit [for-Mac](http://0.0.0.0:8000/api) or [for-Windows](http://127.0.0.1:8000/api) on your browser to check the backed server. Visit [localhost:3000](http://localhost:3000) to view the 
frontend in action. 
<br>

**Step 7:** Refer to Uploading Data section under Notes
<br>

All backend changes will be visible while the server is running. 
However, if any changes are made on the frontend i.e React, javascript etc. (basically anything in the frontend folder) then you should stop the server using `CTRL+C` and restart using `bash start.sh clean`. 

**WARNING:** With clean, this script will prune your other docker images and container. 

Whenever you wish to start development, make sure that the docker engine is opened on your local machine
before running `bash start.sh`.

## Notes (TO BE UPDATED AFTER DEPLOYMENT)
- Any dependencies that you would add using **pip** should simply be added to the requirements.txt file instead
- Admin Panel can be accessed here: [for-Mac](http://0.0.0.0:8000/admin) or [for-Windows](http://127.0.0.1:8000/admin) 
- Since the program is running locally right now, you would have to create a super user yourself. Watch [this]() tutorial made by our team. 

### Uploading Data (For Testing)
When running locally, our application will have no games or forums. The admin/website maitainer is supposed to add these while testing. We made this process easier by including a json file that would load up **3 games and 1 admin user** (username=root, password=1234). To load this data, run the following command after Step 6:

`docker-compose run web python manage.py loaddata test_data.json`
<br>

## For Windows
- change docker-compose.yml file to:
```
version: "3.3"

services:
  db:
    image: postgres:13
    volumes:
      - postgres-vol:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    networks:
      - db

  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
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
