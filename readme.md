# Cherine Special

## Create a new project
1. Create new project
    ```cmd
    mkdir cherine_special
    cd cherine_special
    ```
2. Set local Python version
    ```cmd
    pyenv local 3.10.0b3
    ```
3. Create pyproject.toml with django as dependency
    ```cmd
    poetry init --no-interaction --dependency django
    ```
4. Create virtual environment
    ```cmd
    poetry install
    ```
5. Initiate project
    ```cmd
    poetry run django-admin startproject cherine_special .
    ```

## Create a new app/config
```cmd
python manage.py startapp new_app
```

## Add django-debug-toolbar as dependency
```cmd
poetry add django-debug-toolbar
```

## Migrate
```cmd
python manage.py makemigrations
python manage.py migrate
```

## Create superuser
```cmd
python manage.py createsuperuser
```

## Django REST Framework
```cmd
poetry add djangorestframework
```
