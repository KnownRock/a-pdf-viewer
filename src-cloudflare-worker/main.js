const tokenEndpoint = 'https://www.googleapis.com/oauth2/v4/token'

export default {
  async fetch (request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    try {
      const { CLIENT_ID: clientId, CLIENT_SECRET: clientSecret } = env

      const { grant_type: grantType } = await request.json()

      if (!clientId || !clientSecret) {
        return new Response('Missing client credentials', { status: 500 })
      }

      if (['authorization_code', 'refresh_token'].indexOf(grantType) === -1) {
        return new Response('Invalid grant type', { status: 400 })
      }

      if (grantType === 'refresh_token') {
        console.log('Refreshing token...')

        const { refresh_token: refreshToken } = await request.json()

        return await fetch(tokenEndpoint, {
          method: 'POST',
          body: JSON.stringify({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: grantType
          })
        })
      }

      if (grantType === 'authorization_code') {
        console.log('Exchanging code for token...')

        const { code, redirect_uri: redirectUri, grant_type: grantType } = await request.json()

        return await fetch(tokenEndpoint, {
          method: 'POST',
          body: JSON.stringify({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            // redirect_uri: redirectUri,
            offline_access: true,
            grant_type: grantType
          })
        })
      }


      return new Response('Invalid grant type', { status: 400 })
    } catch (err) {
      return new Response(err.message, { status: 500 })
    }
  }
}
