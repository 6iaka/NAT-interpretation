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
  res.status(200).send(`<!DOCTYPE html>
<html><head><title>Authorizing…</title></head>
<body>
<p>Finishing login. You can close this window if it doesn't close automatically.</p>
<script>
(function () {
  var message = ${JSON.stringify(message)};
  if (!window.opener) {
    document.body.innerHTML =
      '<p>This window must be opened from the admin panel. Please close it and try again.</p>';
    return;
  }
  function receive(e) {
    if (!e.data || typeof e.data !== 'string') return;
    if (e.data.indexOf('authorizing:github') !== 0) return;
    window.opener.postMessage(message, e.origin || '*');
    window.removeEventListener('message', receive, false);
    setTimeout(function () { window.close(); }, 250);
  }
  window.addEventListener('message', receive, false);
  // Signal the opener that we are ready to send the token.
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body></html>`);
};
