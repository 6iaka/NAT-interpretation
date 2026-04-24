/**
 * Step 2 of the GitHub OAuth flow used by Decap CMS.
 *
 * GitHub redirects here with ?code=... after the user authorizes.
 * We exchange the code for an access token, then hand the token
 * back to the Decap CMS popup opener via postMessage, exactly the
 * way the Netlify OAuth provider does.
 */

module.exports = async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).send(
      'Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET environment variable. Set them in the Vercel project settings.'
    );
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const code = url.searchParams.get('code');
  if (!code) {
    res.status(400).send('Missing ?code in callback. Try logging in again.');
    return;
  }

  let payload;
  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });
    payload = await tokenResponse.json();
  } catch (err) {
    res.status(502).send(`Failed to reach GitHub: ${err.message}`);
    return;
  }

  const content = payload && payload.access_token
    ? { token: payload.access_token, provider: 'github' }
    : { error: payload && payload.error_description
        ? payload.error_description
        : 'Unable to obtain access token from GitHub.' };

  const messageType = content.token ? 'success' : 'error';
  const messagePayload = JSON.stringify(content).replace(/</g, '\\u003c');

  // Decap listens for a postMessage in the form:
  //   authorization:<provider>:<success|error>:<json>
  const message = `authorization:github:${messageType}:${messagePayload}`;

  const buildTag = `build ${new Date().toISOString()}`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(`<!DOCTYPE html>
<html><head><title>Authorizing…</title><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;padding:1.5rem;line-height:1.5">
<p id="msg">Finishing login…</p>
<pre id="log" style="font-size:12px;background:#f4f4f6;padding:.75rem;border-radius:.5rem;white-space:pre-wrap;max-height:40vh;overflow:auto"></pre>
<p style="font-size:11px;color:#888">${buildTag}</p>
<script>
(function () {
  var message = ${JSON.stringify(message)};
  var logEl = document.getElementById('log');
  var msgEl = document.getElementById('msg');
  function log(line) {
    var t = new Date().toISOString().slice(11, 23);
    logEl.textContent += '[' + t + '] ' + line + '\\n';
  }
  log('popup loaded');
  if (!window.opener || window.opener.closed) {
    msgEl.textContent = 'This window must be opened from the admin panel.';
    log('ERROR: window.opener is null or closed');
    return;
  }
  log('window.opener OK');
  var announceTimer = null;
  var giveUpTimer = null;
  var ticks = 0;
  function done() {
    if (announceTimer) clearInterval(announceTimer);
    if (giveUpTimer) clearTimeout(giveUpTimer);
    window.removeEventListener('message', receive, false);
  }
  function receive(e) {
    log('received message from ' + e.origin + ': ' + String(e.data).slice(0, 80));
    if (!e.data || typeof e.data !== 'string') return;
    if (e.data.indexOf('authorizing:github') !== 0) return;
    try {
      window.opener.postMessage(message, e.origin || '*');
      log('sent authorization payload to opener');
      msgEl.textContent = 'Signed in. You can close this window.';
    } catch (err) {
      log('ERROR posting token: ' + err.message);
    }
    done();
    setTimeout(function () { try { window.close(); } catch (_) {} }, 400);
  }
  window.addEventListener('message', receive, false);
  announceTimer = setInterval(function () {
    ticks++;
    if (!window.opener || window.opener.closed) {
      log('opener went away after ' + ticks + ' ticks');
      done();
      msgEl.textContent = 'The admin window was closed. Please try again.';
      return;
    }
    try {
      window.opener.postMessage('authorizing:github', '*');
    } catch (err) {
      log('ERROR announcing: ' + err.message);
    }
    if (ticks === 1 || ticks % 10 === 0) {
      log('announced authorizing:github (tick ' + ticks + ')');
    }
  }, 100);
  giveUpTimer = setTimeout(function () {
    done();
    msgEl.textContent = 'Login timed out. The admin window is not responding. Close this and try again.';
    log('gave up after ' + ticks + ' ticks');
  }, 15000);
})();
</script>
</body></html>`);
};
