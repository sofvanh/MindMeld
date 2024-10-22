# MindMeld backend

`npm install`, followed by `npm run dev` for dev mode, `npm run build` and `npm start` for production. Open [http://localhost:3001](http://localhost:3001) to see the server running in dev mode.

## Environment variables

The following env vars are required when running the app (esp locally, maybe outdated for production):

- `DB_USER`
- `DB_HOST`
- `DB_NAME`
- `DB_PASSWORD`
- `OPENAI_API_KEY`
- `GOOGLE_CLIENT_ID`

## Using docker

### Development

Build the development image with `docker build -f Dockerfile.dev -t mindmeld-backend-dev .`

Run the container with `docker run -p 3001:3001 -v $(pwd):/app mindmeld-backend-dev`

## Deployment

Create new image in Google Cloud with `./build.sh [IMAGE_NAME]`

Deploy the image with `./deploy.sh [IMAGE_NAME]`

Show logs with `gcloud run services logs read mindmeld`

See all images with `gcloud container images list`