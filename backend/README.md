# Empire Backend

A Node.js/Express backend server for the Empire project, written in TypeScript.

## Prerequisites

### Node.js and npm

This project requires Node.js version 18 or higher. We recommend using **nvm** (Node Version Manager) to manage Node.js versions.

#### Installing nvm

Please refer to the [nvm repo](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) for the latest guidelines and changes.

**macOS and Linux:**

```bash
# Install nvm using curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Or using wget
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# For Mac with Homebrew
brew install nvm
```

#### Setting up Node.js with nvm

Please also refer to [nvm repo](https://github.com/nvm-sh/nvm?tab=readme-ov-file#long-term-support) for Node.js installation and LTS.

```bash
nvm install --lts
nvm use --lts
node --version
npm --version
```

## Environment Variables

Create environment files for each environment you use (e.g. `.env.dev`, `.env.production`). Example for development:

```bash
# .env.dev
PORT=<backend_port_you_want> # e.g. 5001
SESSION_SECRET=<your_session_secret> # any random secret
GOOGLE_CLIENT_ID=<google_client_id> # from your google OAuth
GOOGLE_CLIENT_SECRET=<google_client_secret> # from your google OAuth
FRONTEND_URL=<your_frontend_url> # e.g. http://localhost:3000
PG_USER=<postgre_user> # from your postgreSQL
PG_HOST=<postgre_host> # from your postgreSQL
PG_DATABASE=<postgre_database_name> # from your postgreSQL
```

- The backend loads environment variables from `.env.<NODE_ENV>` (e.g. `.env.dev` if `NODE_ENV=dev`).
- Never commit your `.env.*` files to version control.

### Obtaining Google Client ID and Secret

We use Google OAuth for authentication. To use Google OAuth, you need to create credentials in the Google Cloud Console:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create a new project (or select an existing one).
3. Navigate to **APIs & Services > Credentials**.
4. Click **Create Credentials** and select **OAuth client ID**.
5. Configure the consent screen and set the application type (usually "Web application").
6. Add your authorized redirect URIs.
7. After creation, you will see your **Client ID** and **Client Secret**.

For more details, refer to the [official Google documentation](https://developers.google.com/identity/protocols/oauth2/web-server#enable-apis).

### PostgreSQL Database

Setup your PostgreSQL database for development and get host name, user name, and database name for environment variables.

Other than set up the database by yourself, we will provide a Dockerfile to quickly set up a local PostgreSQL database for development.

#### Using Docker

TBD

## Installation

```bash
cd backend
npm install
```

## Build

Transpile TypeScript to JavaScript:

```bash
npm run build
```

## Running the Server

### Development

```bash
npm run dev
```

- Uses `nodemon` to watch for changes and restarts automatically.
- Loads environment from `.env.dev` (set `NODE_ENV=dev`).

### Production

```bash
npm run build
npm run prod
```

- Loads environment from `.env.production` (set `NODE_ENV=production`).

## Project Structure

```
backend/
├── src/
│   ├── controllers/   # Request handlers
│   ├── db/            # Database connection and initialization
│   ├── middleware/    # Express middleware (e.g., authentication)
│   ├── models/        # Data models
│   ├── routes/        # API route definitions
│   ├── services/      # external library integrations
│   ├── types/         # TypeScript type definitions
│   └── app.ts         # Main application entry point
├── dist/              # Compiled JavaScript output
├── package.json       # NPM dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── .env.*             # Environment variable files (never commit)
```

## Troubleshooting

- **Node version issues:** Ensure you are using the correct Node.js version with nvm.
- **CORS issues:** Make sure `FRONTEND_URL` matches your frontend's URL.
