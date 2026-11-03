import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.API_PORT, env.API_HOST, () => {
  console.log(`QGHS CONNECT API listening on http://${env.API_HOST}:${env.API_PORT}`);
  console.log("Health endpoint: /api/health");
  console.log("Authenticated portal routes are enabled; configure Access and JWT secrets before use.");
});
