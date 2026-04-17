/**
 * Step 1 of the GitHub OAuth flow used by Decap CMS.
 *
 * Decap opens this endpoint in a popup when the owner clicks
 * "Login with GitHub" at /admin/. We simply redirect to GitHub's
 * authorization screen; GitHub will call /api/callback when done.
 */

module.exports = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send(
      'Missing GITHUB_CLIENT_ID environment variable. Set it in the Vercel project settings.'
    );
    return;
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${proto}://${host}/api/callback`;

  const state = Math.random().toString(36).slice(2);
  const scope = 'repo,user';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
    allow_signup: 'false'
  });

  res.writeHead(302, {
    Location: `https://github.com/login/oauth/authorize?${params.toString()}`
  });
  res.end();
};
