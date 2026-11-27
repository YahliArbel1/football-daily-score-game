# Scordle

[![Build and deploy](https://github.com/YahliArbel1/scordle/actions/workflows/deploy.yml/badge.svg)](https://github.com/YahliArbel1/scordle/actions/workflows/deploy.yml)

A daily football score-guessing game. **Play it: https://yahliarbel1.github.io/scordle/**

The full spec is in [SPEC.md](SPEC.md).

## Run locally

```powershell
npm install
npm run dev     # then open the URL it prints (http://localhost:5173/scordle/)
npm test        # run the unit tests
```

Every push to `main` is tested, built and published automatically by
[.github/workflows/deploy.yml](.github/workflows/deploy.yml).
