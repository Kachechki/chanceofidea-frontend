# Chance of Idea — Frontend

Chance of Idea is a marketplace for unfinished projects. This repository contains
the web app: browsing and filtering projects, publishing and editing listings,
applying to take over a project, and following a repository transfer through
to completion. Users sign in with GitHub.

The app is built with Nuxt 4, Vue 3, Pinia, and Tailwind CSS. It talks to the
backend only through its own server routes, so the browser never sees a token.

## Features

- GitHub sign-in with a server-held session (httpOnly refresh cookie)
- Project catalog with search, category and tag filters, sort, and pagination
- Project pages with status, readiness, owner, and repository details
- Publishing, drafting, editing, and deleting projects
- Adoption applications, with owner accept and reject
- Transfer flow: applicant confirmation or decline, with step-by-step banners
- Profile page with created projects, incoming and outgoing requests
- Accessible modals, keyboard navigation, and responsive layouts

## Requirements

- Node.js 20.19 or later, or 22.12 or later (Nuxt 4 requirement)
- npm, or pnpm for the production image
- A running backend API (see the backend README)
- A GitHub OAuth App

## Configuration

Create a `.env` file in the repository root, or just copy `.env.example`. These variables are read at runtime,
so you can change them without rebuilding:

| Variable                       | Description                                                       |
| ------------------------------ | ----------------------------------------------------------------- |
| `NUXT_BACKEND_URL`             | Base URL of the backend API (defaults to `http://localhost:4000`) |
| `NUXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth App client ID used for the sign-in redirect          |
| `NUXT_PUBLIC_GITHUB_APP_SLUG`  | GitHub App slug (the name in `github.com/apps/<slug>`), used for the install link |

Configure the GitHub OAuth App's callback URL to point at the frontend, not the
backend: `http://localhost:3000/auth/callback` for local development, or
`https://<your-domain>/auth/callback` in production. The app builds the redirect
URI from the current origin, so the two must match exactly.

Do not commit `.env` or production secrets to source control.

## Run locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app listens on `http://localhost:3000` by default. It expects the backend at
`NUXT_BACKEND_URL`, so start the backend first.

For a production build:

```bash
npm run build
node .output/server/index.mjs
```

## Run with Docker

Two images are provided:

- `Dockerfile` runs the development server with hot reload. Use it for local
  development with Docker Compose.
- `Dockerfile.prod` builds the Nuxt server bundle and runs it with Node. Use it
  for deployment.

Build and run the production image:

```bash
docker build -f Dockerfile.prod -t chanceofidea-frontend .
docker run -p 3000:3000 -e NUXT_BACKEND_URL=http://backend:4000 chanceofidea-frontend
```

Docker Compose runs the development image. It reads `.env`, mounts the source
for live reload, and publishes the port set by `FRONTEND_PORT` (default `3000`):

```bash
docker compose up frontend
```

Inside the compose network, the backend is reached by its service name, so set
`BACKEND_URL` in `.env` accordingly, for example `http://backend:4000`.

## How requests reach the backend

The browser never calls the backend directly. Everything goes through the
Nuxt server, which avoids CORS and keeps credentials out of the client.

| Server route              | Purpose                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `POST /api/auth/callback` | Exchanges the GitHub code with the backend and stores the refresh token in an httpOnly cookie |
| `POST /api/auth/logout`   | Clears the session cookie                                                                     |
| `/api/**`                 | Forwards every other request to the backend, attaching the refresh cookie                     |

If the backend returns 401 while a session cookie is present, the server clears
the session. Requests without a cookie are forwarded as guest requests, so public
pages keep working when signed out.

## Pages

| Route                 | Page                                                     |
| --------------------- | -------------------------------------------------------- |
| `/`                   | Landing page with stats, categories, and calls to action |
| `/login`              | Sign-in page (email login is disabled for now)           |
| `/auth/callback`      | Completes the GitHub sign-in                             |
| `/projects`           | Catalog with search, filters, sort, and pagination       |
| `/projects/create`    | Publish a project, or save it as a draft                 |
| `/projects/[id]`      | Project details, status banner, and the apply action     |
| `/projects/[id]/edit` | Edit, publish, or delete a project you own               |
| `/me`                 | Profile: created projects, adopted projects, requests    |
| `/privacy`, `/terms`  | Legal pages                                              |

## Project structure

```
app/
  app.vue                 root component, head metadata, session check
  layouts/default.vue     header, main content, footer
  pages/                  file-based routes
  components/             feature components (cards, banners, modals)
  components/modals/      confirmation and form dialogs
  widgets/                header, footer, and the shadcn-style UI kit
  stores/                 Pinia stores: projects and requests
  composables/useAuth.ts  session state and sign-in redirect
  lib/                    validation, project helpers, transfer stages
  types/                  shared entity types
server/
  api/                    proxy and auth routes
  utils/auth-cookies.ts   session cookie helpers
```

## Transfer flow

The app shows each step of a transfer as a banner, and the matching modal walks
the user through the action. The stage is derived from the application status and
the project status, so the same rules apply on the project page, the request
cards, and the profile.

1. The owner accepts an application. The project becomes `TRANSFERRING`.
2. GitHub sends the applicant a transfer request, which they accept on GitHub.
3. The applicant confirms receipt in the app, or declines. Confirming marks the
   project `ADOPTED`. Declining returns it to `PUBLISHED`.

Transfers need the GitHub App installed on the owner's account, with the repository
selected. Authorizing the app is not enough. On the profile page, use the **Install
GitHub app** button before accepting an applicant. The button stays visible after
installing, so it can also be used to change which repositories the app can access.
In the app's settings, set the Setup URL to `https://<your-domain>/me` so GitHub
returns to the profile after installing.

## Quality checks

```bash
npm run build
```

There is no lint or type-check script yet. `nuxt build` compiles the app but does not
report type errors, so run `npx nuxi typecheck` separately before a release.

## License

Not yet specified.
