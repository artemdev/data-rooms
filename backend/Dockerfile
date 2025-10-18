# Docker-команда FROM вказує базовий образ контейнера
FROM python:3.12

ENV APP_HOME=/app

WORKDIR $APP_HOME


COPY requirements.txt .

RUN pip install -r requirements.txt


COPY . .

EXPOSE 8000

ENTRYPOINT ["sh", "-c", "alembic upgrade head && python seed.py && python main.py"]