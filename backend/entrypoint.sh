#!/bin/sh

python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py seed_test_data

exec python manage.py runserver 0.0.0.0:8000