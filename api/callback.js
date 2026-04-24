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

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(`<!DOCTYPE html>
<html><head><title>Authorizing…</title><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;padding:1.5rem;line-height:1.5">
<p id="msg">Finishing login…</p>
<script>
(function () {
  var message = ${JSON.stringify(message)};
  var msgEl = document.getElementById('msg');
  if (!window.opener || window.opener.closed) {
    msgEl.textContent = 'This window must be opened from the admin panel. Please close it and try again.';
    return;
  }
  var announceTimer = null;
  var giveUpTimer = null;
  function done() {
    if (announceTimer) clearInterval(announceTimer);
    if (giveUpTimer) clearTimeout(giveUpTimer);
    window.removeEventListener('message', receive, false);
  }
  function receive(e) {
    // Decap echoes the handshake string back to the popup once it has
    // registered its authorization listener. Ignore anything else.
    if (typeof e.data !== 'string' || e.data.indexOf('authorizing:github') !== 0) return;
    try {
      window.opener.postMessage(message, e.origin || '*');
      msgEl.textContent = 'Signed in. You can close this window.';
    } catch (_) {}
    done();
    setTimeout(function () { try { window.close(); } catch (_) {} }, 300);
  }
  window.addEventListener('message', receive, false);
  // Decap attaches its message listener after opening the popup, so a
  // one-shot announcement at load time can race ahead of the listener.
  // Keep announcing until we get an echo back, then deliver the token.
  announceTimer = setInterval(function () {
    if (window.opener && !window.opener.closed) {
      try { window.opener.postMessage('authorizing:github', '*'); } catch (_) {}
    }
  }, 100);
  giveUpTimer = setTimeout(function () {
    done();
    msgEl.textContent = 'Login timed out. Please close this window and try again.';
  }, 15000);
})();
</script>
</body></html>`);
};
