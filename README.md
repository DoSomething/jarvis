# Jarvis

DoSomething.org's natural language interface.

> :memo: For more extensive documentation please see the Github wiki.

# Setup

## Prequisites
* [Mongo](https://www.mongodb.com/download-center)
* [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

## Installation
1. `git clone https://github.com/DoSomething/jarvis.git`
2. `cd jarvis`
3. `cp .env.example .env`
4. `pnm install`
5. `npm run seed`

# Development
Use `npm run start` to execute the server, which handles both MongoDB & Jarvis. Jarvis is running behind Nodemon, so any file saves will restart the node server automatically.

## Testing
Please write tests for all functionality & do a `npm run test` before merging your changes.

All tests are located under the `test/` folder, we use Mocha, Chai & prefer assertion style.

## Contributing
All code belongs in a feature branch which is merged into master.

## Linting
We use the DoSomething [eslint-config](https://github.com/DoSomething/eslint-config) which is based on the [Airbnb style guide](https://github.com/airbnb/javascript). You can lint all files with `npm run lint`.

If you add new root level folders containing application logic, please add the folder in the `package.json` lint script.

## Strict Mode
All files should `"use script"`. It can be easy to forget this, so use `npm run strict` to automatically add it to all files which don't already have it.

## Database
Use `npm run seed` to setup test nodes, flow & keyword.

## Deployments
When code is merged into master, a deployment to staging is automatically triggered. When ready to promote to production, you can promote the slug from the staging app to production. You can read more on promoting [here](https://devcenter.heroku.com/articles/pipelines#promoting).

----

![jarvis logo](jarvis.jpg)
