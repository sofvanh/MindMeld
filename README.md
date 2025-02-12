# Nexus (formerly MindMeld)

> **Note**: We're in the process of renaming the project from MindMeld to Nexus. Some parts of the codebase and documentation still use the old name.

Nexus is a full-stack application designed to facilitate group deliberation using AI. It draws inspiration from platforms like [Polis](https://pol.is/home) and [Community Notes by X](https://www.lesswrong.com/posts/sx9wTyCp5kgy8xGac/community-notes-by-x). You can access the deployment [here](https://nexus-tool.com).

## Development Setup

1. **Install Dependencies**
   ```bash
   npm run install:all  # Installs both frontend and backend dependencies
   ```

2. **Environment Variables**
   - Frontend (`.env` in frontend/):
     - `REACT_APP_OAUTH_CLIENT_ID`: Google OAuth client ID
     - `REACT_APP_BACKEND_URL`: Defaults to http://localhost:3001; Has to be set for production

   - Backend (`.env` in backend/):
     - `DB_USER`: Database username
     - `DB_HOST`: Database host
     - `DB_NAME`: Database name
     - `DB_PASSWORD`: Database password
     - `OPENAI_API_KEY`: OpenAI API key
     - `GOOGLE_CLIENT_ID`: Google OAuth client ID (same as frontend)

3. **Run Development Servers**
   ```bash
   npm run dev  # Starts both frontend (port 3000) and backend (port 3001)
   ```

For detailed commands related to individual frontend or backend tasks, refer to the `package.json` files in their respective directories.

## Design

The branding and design system documentation can be found at `/design`. You can view it live [here](https://nexus-tool.com/design).

## Deployment

- **Frontend**: Automatically deployed to Netlify
- **Backend**: Automatically deployed to Google Cloud Run via GitHub Actions

## Docker Development

Build and run the development container:
```bash
cd backend
docker build -f Dockerfile.dev -t mindmeld-backend-dev .
docker run -p 3001:3001 -v $(pwd):/app mindmeld-backend-dev
```

## Useful Commands

View Cloud Run logs:
```bash
gcloud run services logs read mindmeld --project=mindmeld-backend
```

List container images:
```bash
gcloud container images list
```
