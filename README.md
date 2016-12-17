# Jarvis

DoSomething.org's natural language interface.

# Setup

## Prequisites
* [Mongo](https://www.mongodb.com/download-center)
* [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

## Installation
1. `git clone https://github.com/DoSomething/jarvis.git`
2. `cd jarvis`
3. `cp .env.example .env`
4. `npm run seed`

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

## Database
Use `npm run seed` to setup test nodes, flow & keyword.
Make sure your .env is pointing to the correct database.

# Heroku Setup
All instances of this service live in a dedicated Heroku pipeline. The pipeline is configured to host review apps, staging application & production application.

## Deployments
When code is merged into master, a deployment to staging is automatically triggered. When ready to promote to production, you can promote the slug from the staging app to production. You can read more on promoting [here](https://devcenter.heroku.com/articles/pipelines#promoting).

----

![jarvis logo](jarvis.jpg)
