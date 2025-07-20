# Empire Web App

A React-based web application built with TypeScript, Redux Toolkit, and Tailwind CSS.

## Prerequisites

### Node.js and npm

This project requires Node.js version 18 or higher. We recommend using **nvm** (Node Version Manager) to manage Node.js versions.

#### Installing nvm

**macOS and Linux:**

Please also refer to [nvm repo](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) for the latest guideline and changes.

```bash
# Install nvm using curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# Or using wget
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# For macbook with brew installed
brew install nvm
```

#### Setting up Node.js with nvm

Please also refer to [nvm repo](https://github.com/nvm-sh/nvm?tab=readme-ov-file#long-term-support) for Node.js installation and LTS.

```bash
# Install the latest LTS version of Node.js
nvm install --lts

# Use the installed version
nvm use --lts

# Set as default (optional)
nvm alias default node

# Verify installation
node --version
npm --version
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd empire/web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm start
```

The application will open in your browser at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner (currently implementing)
- `npm run eject` - Ejects from Create React App (one-way operation) (currently not used)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── store/         # Redux store configuration
├── context/       # React context providers
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── App.tsx        # Main application component
├── index.tsx      # Application entry point
└── setupProxy.js  # Development proxy configuration
```

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **React Calendar** - Calendar component

## Development

### Environment variable

For development, add `.env.development` file with the following format

```bash
REACT_APP_API_URL=<your_backend_server_url> # e.g. http://localhost:5001
```

and in `setupProxy.js`, change the target to your backend server url

```js
module.exports = function (app) {
  app.use(
    ["/auth/google", "/auth/logout"],
    createProxyMiddleware({
      target: <your_backend_server_url>, // e.g. http://localhost:5001
      changeOrigin: false,
    })
  );
};
```

### Adding Dependencies

If you need to install new package, install with the correct dependency.

```bash
# Install a production dependency
npm install package-name

# Install a development dependency
npm install --save-dev package-name
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Troubleshooting

### Common Issues

1. **Node version issues**: Make sure you're using the correct Node.js version with nvm
2. **Port conflicts**: If port 3000 is in use, the development server will automatically try the next available port
3. **Dependency issues**: Try deleting `node_modules/` and `package-lock.json`, then run `npm install` again

### Getting Help

If you encounter any issues:

1. Check the console for error messages
2. Ensure all dependencies are properly installed
3. Verify you're using the correct Node.js version
