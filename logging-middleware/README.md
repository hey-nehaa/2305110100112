## Logging Middleware

Sends structured logs to the evaluation test server.

### How to use

```js
import { initLogger, Log } from "logging-middleware";

// call this once when the app starts
initLogger({ email, name, rollNo, accessCode, clientID, clientSecret });

// then log stuff wherever needed
Log("frontend", "info", "component", "notifications page loaded");
```

The token gets cached automatically so it only hits /auth once.
