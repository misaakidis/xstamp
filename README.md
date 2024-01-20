# xstamp
Digital stamp duty service over XRPL

[![Build Status](https://github.com/misaakidis/xstamp/actions/workflows/static.yml/badge.svg)](https://github.com/misaakidis/xstamp/actions/workflows/static.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview
xstamp is a digital stamp duty service over the XRP Ledger.

*This project is developed in the context of the Odyssey XRPL hackathon and is not associated with the Republic of Cyprus.*


## Development

### Frontend deployment on Github Pages
Frontend deployment is automated via the `.github/workflows/static.yml` workflow, triggered on push to the `main` branch and deploys the frontend to the `gh-pages` branch.

### Backend deployment on Heroku
1. Create a new app on Heroku
2. Add the following buildpacks:
    - heroku/nodejs
3. Set env variables for issuer wallet seed (`XRP_SEED`) and port (`PORT`)
4. Create a git subtree for the backend folder and push to Heroku
    - `git subtree push --prefix backend heroku main`
5. Set automatic deployments from the `heroku` branch


## License

This project is licensed under the terms of the [MIT](https://choosealicense.com/licenses/mit/) license.