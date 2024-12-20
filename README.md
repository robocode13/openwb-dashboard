[![Node.js CI](https://github.com/robocode13/openwb-dashboard/actions/workflows/node.js.yml/badge.svg)](https://github.com/robocode13/openwb-dashboard/actions/workflows/node.js.yml)

# OpenWB - Dashboard

Ein übersichtliches Dashboard für die OpenWB Wallbox mit zusätzlichen Statistiken und Informationen

## Screenshots

### Übersicht

<img src="docs/OpenWB-Dashboard-Screenshot1.png" alt="Screenshot 1">

### Einstellungen

<img src="docs/OpenWB-Dashboard-Screenshot2.png" alt="Screenshot 2" width=700>

## Getting Started

Diese Anweisungen erklären, wie man das Projekt auf einem lokalen Rechner für Entwicklungs- und Testzwecke zum Laufen bringt. Siehe [Deployment](#deployment) für Hinweise, wie das Projekt auf einem Server-System bereitgestellt werden kann.

### Vorraussetzungen

Dieses Projekt nutzt [pnpm](https://pnpm.io/) als Package-Manager.

### Installation

Zum installieren aller Abhängigkeiten:

```
pnpm install
```

ausführen.

Entwicklungs-Server starten:

```
pnpm run dev
```

## Tests

Unit-Tests sind mit _vitest_ implementiert und können mit

```
pnpm test
```

oder in _VSCode_ mit der _vitest_ Extension ausgeführt werden.

## Deployment

Mit

```
pnpm run build
```

kann das Projekt gebaut werden. Die Ausgabe im `build` Ordner kann auf einen Server mit NodeJS gehostet werden (`node index.js`).

### Docker

Ein Deployment über Docker ist ebenfalls möglich. Das aktuellste Image erhält man über

```
docker pull robocode13/openwb-dashboard
```

Ein Container läßt sich dann folgendermaßen starten:

```
docker run -d --name openwb-dashboard -p 3000:3000 -v openwb-dashboard:/app/config robocode13/openwb-dashboard
```

Die Webseite ist dann im Browser unter http://localhost:3000 verfügbar.

## Verwendete Tools und Frameworks

- [SvelteKit](https://kit.svelte.dev/) - Web Framework
- [Bootstrap](https://getbootstrap.com/) - CSS Framework
- [TypeScript](https://www.typescriptlang.org/) - Programmiersprache
- [pnpm](https://pnpm.io/) - Node Package Manager

## License

This project is licensed under the GPL-3.0 license - see the [LICENSE](LICENSE) file for details
