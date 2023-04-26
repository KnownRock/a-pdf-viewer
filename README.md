# A PDF Viewer

This is a PDF viewer built with Svelte and PDF.js.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

### VS Code Recommand Setting

.vscode/extensions.json

```json
{
  "recommendations": ["svelte.svelte-vscode"]
}
```

.vscode/settings.json

```json
{
  "i18n-ally.localesPaths": [
    "src/i18n"
  ],
  "eslint.validate": [
    "svelte"
  ],
  "i18n-ally.keystyle": "flat",
  "i18n-ally.sourceLanguage": "en"
}
```


## Get started

Install the dependencies...

```bash
npm install
```

Start [Vite](https://vitejs.dev/) in development mode:

```bash
npm run dev
```

Navigate to [localhost:5174](http://localhost:5174). You should see your app running.

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

## Google API Setup

See official docs [here](https://developers.google.com/drive/api/quickstart/js).


## Setting up .env and .env.production

Create a .env file in the root of the project and add the following:

```bash
VITE_GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
VITE_SITE=http://localhost:5174
```

Create a .env.production file in the root of the project and add the following:

```bash
VITE_GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
VITE_SITE=YOURSITE.com
```


## Deploying to the web

### Deploying to Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com/) is a great way to deploy your Svelte app to the web for free.

1. Create a new project on Cloudflare Pages.
2. Connect your GitHub account.
3. Select your repository.

