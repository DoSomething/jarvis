# Jarvis

DoSomething.org's natural language interface.

# Setup
## With Docker
1. `git clone`
2. `docker-compose up`

#### Docker setup under the hood
Jarvis is executed by `Foreman` to handle process management & mimic Heroku.
`Nodemon` will autoreload the server when a file changes.
The compose file defines env variables for connection details & network mapping.

## Without Docker
1. Run an instance of MongoDB.
  * Install locally & run with `mongod`
2. Edit .env with correct service URI, most likely in for the form of localhost:27017
3. `npm start` (requires Foreman from the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli))

# Development
## Testing
Please write tests for all functionality of the service.

All tests are located under the `test/` folder. Mocha, Chai, Nock & Supertest are available for use.

Run tests with `npm test`.

## Contributing
All new code belongs in a feature branch which is merged into master. Please tag new production releases with the version bump script in the bin folder.

## Linting
We use the DoSomething [eslint-config](https://github.com/DoSomething/eslint-config) which is based on the [Airbnb style guide](https://github.com/airbnb/javascript).

If you add new root level folders containing application logic, please add the folder in the `package.json` lint script.

You can lint all files with `npm run lint`.

## Strict Mode
All files should `"use script"`. It can be easy to forget this, so use `npm run strict` to automatically add it to all files which don't already have it.

# Heroku Setup
All instances of this service live in a dedicated Heroku pipeline. The pipeline is configured to host review apps, staging application & production application.

## Deployments
When code is merged into master, a deployment to staging is automatically triggered. When ready to promote to production, you can promote the slug from the staging app to production. You can read more on promoting [here](https://devcenter.heroku.com/articles/pipelines#promoting).

----

![jarvis logo](jarvis.jpg)
