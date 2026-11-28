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

## Credits

- Fonts: [Anton](https://github.com/googlefonts/AntonFont), [Barlow](https://github.com/jpt/barlow)
  and Press Start 2P, all under the SIL Open Font License 1.1. Their copyright notices and the
  license ship with the site in [public/THIRD-PARTY-NOTICES.txt](public/THIRD-PARTY-NOTICES.txt).
- Sounds: generated in code ([src/ui/synth.ts](src/ui/synth.ts)); no third-party audio.

Scordle is an independent fan game, not affiliated with or endorsed by UEFA, FIFA or any club or
player. Competition, team and player names are used only to identify real matches.

## License

© 2026 Yahli Arbel. All rights reserved.

The source code is public so it can be read, but it is not licensed for reuse. Third-party parts
(see Credits) keep their own licenses.
