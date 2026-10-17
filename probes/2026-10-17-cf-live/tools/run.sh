#!/usr/bin/env bash
# Probe run for a Claude cloud routine: open a Cloudflare Browser Run session
# over HTTP (the environment proxy adds Authorization), then drive its page
# target over the live.browser.run WebSocket, which authenticates with a
# session JWT in the URL. The JWT stays in /tmp and is never printed.
# Usage: bash run.sh <outDir>
set -u
A=a1f8720ddbca00934ad42b067ea2617b
B=https://api.cloudflare.com/client/v4/accounts/$A/browser-run
O=${1:?usage: run.sh <outDir>}
T=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$O"

# 0. Which hosts the proxy lets through, and whether it intercepts TLS.
for h in live.browser.run api.cloudflare.com; do
  echo "== $h"
  curl -sS -v -o /dev/null -w 'http=%{http_code}\n' --max-time 15 "https://$h/" 2>&1 | grep -E -i '^\* +(issuer|subject):|^< HTTP/|^http=|^curl:' | head -6
done | tee "$O/0-hosts.txt"

# 1. Acquire a session and find its page target.
curl -sS --max-time 30 -X POST "$B/devtools/browser?keep_alive=120000" -o /tmp/sess.json
SID=$(node -e 'try { console.log(require("/tmp/sess.json").sessionId || "") } catch { console.log("") }')
if [ -z "$SID" ]; then echo "no session:"; head -c 400 /tmp/sess.json; echo; exit 2; fi
echo "session ok"
sleep 2
curl -sS --max-time 20 "$B/devtools/browser/$SID/json/list" -o /tmp/list.json
node -e '
const fs = require("fs");
const list = JSON.parse(fs.readFileSync("/tmp/list.json", "utf8"));
const page = list.find((t) => t.type === "page");
fs.writeFileSync("/tmp/page-ws.txt", page ? page.webSocketDebuggerUrl : "");
fs.writeFileSync(process.argv[1] + "/1-json-list.json", JSON.stringify(list, null, 2).replace(/jwt=[^"&\s]+/g, "jwt=REDACTED") + "\n");
console.log("page target host:", page ? new URL(page.webSocketDebuggerUrl).host : "none");
' "$O"

# 2. Capture over CDP.
node "$T/cdpcap.mjs" "$O" /tmp/page-ws.txt
RC=$?

# 3. Always close the session.
curl -sS --max-time 20 -X DELETE "$B/devtools/browser/$SID" -D /tmp/del.h -o /tmp/del.json
echo "delete: $(head -c 100 /tmp/del.json) browser_ms_used=$(grep -i '^x-browser-ms-used' /tmp/del.h | tr -d '\r' | cut -d' ' -f2)"
rm -f /tmp/page-ws.txt /tmp/list.json /tmp/sess.json

# 4. No JWT may reach the repo.
if grep -r -l -E 'jwt=[^R]' "$O"; then echo "JWT LEAK: do not commit"; exit 3; fi
exit $RC
