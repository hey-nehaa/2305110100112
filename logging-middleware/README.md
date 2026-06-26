## Logging Middleware

Reusable logging module that sends structured logs to the evaluation server.

### Usage

```js
import { initLogger, Log } from "logging-middleware";

initLogger({
  email: "...",
  name: "...",
  rollNo: "...",
  accessCode: "...",
  clientID: "...",
  clientSecret: "...",
});

Log("frontend", "info", "component", "page rendered successfully");
```

### Parameters

`Log(stack, level, package, message)`

- **stack**: `"backend"` | `"frontend"`
- **level**: `"debug"` | `"info"` | `"warn"` | `"error"` | `"fatal"`
- **package**: depends on stack (see setup doc for full list)
- **message**: descriptive string
