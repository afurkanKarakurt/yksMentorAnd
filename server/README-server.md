Server proxy for Gemini (local dev)

Setup

1. In `server/` folder create `.env` (copy from `.env.example`) and set your `GEMINI_API_KEY`.

2. Install dependencies and run:

```bash
cd server
npm install
node index.js
```

3. Replace client `ChatBot` proxy URL if needed. For real devices, replace `localhost` with your machine LAN IP (e.g. `http://192.168.1.115:3000`).

Emulator / Device notes:

- Android emulator (AVD): use `http://10.0.2.2:3000` from the app to reach your machine.
- iOS simulator: `http://localhost:3000` works.
- Physical phone (Expo Go): find your PC's IPv4 address with `ipconfig` and set `DEVICE_PROXY_URL` in `components/ChatBot.js`, e.g. `http://192.168.1.34:3000`.

After changing `DEVICE_PROXY_URL` or emulator settings, restart Expo with cache clear:
```bash
npx expo start -c
```
