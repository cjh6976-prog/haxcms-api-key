# HAX API Key Settings

A standalone Lit and HAX DDD component prototype for [HAX issue #2837](https://github.com/haxtheweb/issues/issues/2837).

## Local development

```sh
npm install
npm start
```

Open the URL printed by the development server.

### Vercel development

Run `vercel dev` from this folder. On the first run, follow the CLI prompts to
link the folder to your Vercel project. Open the localhost URL printed by Vercel.
The Vercel configuration starts the same development server using Vercel's
assigned internal port. The public local port defaults to 3000, or use
`vercel dev --listen 3001` to choose another port.

## Prototype workflow

Select a built-in provider, enable it, and enter sample credentials. Provider
definitions drive the form fields. Anthropic and custom connections also expose
an endpoint and optional model. Add provider creates a custom connection that
can be removed. Built-in definitions are fixed.

Save changes validates all enabled providers and saves the entire draft in
memory. Discard restores the last saved settings, including provider additions
and removals. Reloading resets the demo. Use sample credentials.

This prototype demonstrates the UI and data shape. Backend storage,
authentication, OAuth, and live provider requests are future integration work.
