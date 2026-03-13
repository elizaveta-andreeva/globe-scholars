# Globe Scholars

## How to start the project
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Use following commands to start the project:

```bash
docker-compose up --build
```

## How to run tests

1. Make sure the project is running.
2. Use following command to run tests from `frontend/globe-scholars` directory:
```bash
ng test --watch=false --code-coverage 
```
## How to run end-to-end tests
1. Make sure the project is running.
2. Use following command to run end-to-end tests from `frontend/globe-scholars` directory:
```bash
npx cypress open
```