## Running the Project with Docker

This project provides a Docker setup for streamlined local development and deployment. The included `Dockerfile` and `docker-compose.yml` are tailored for this TypeScript/Node.js application.

### Requirements
- **Node.js version:** 22.13.1 (as specified in the Dockerfile)
- **Exposed port:** `3000` (the application runs on this port)
- **Environment variables:** If your project requires environment variables, ensure you have a `.env` file in the project root. Uncomment the `env_file` line in `docker-compose.yml` to enable this.

### Build and Run Instructions
1. **Build and start the app:**
   ```sh
   docker compose up --build
   ```
   This will build the Docker image and start the container using the configuration in `docker-compose.yml`.

2. **Access the app:**
   - The application will be available at [http://localhost:3000](http://localhost:3000).

### Configuration Notes
- The Docker setup uses a multi-stage build to optimize the final image size and security.
- The app runs as a non-root user (`appuser`) for improved security.
- If you need to provide environment variables, create a `.env` file in the project root and uncomment the `env_file` line in `docker-compose.yml`.
- No external services (e.g., databases) are configured by default. If your app requires additional services, add them to `docker-compose.yml` under `services` and update `depends_on` as needed.

### Ports
- **3000:** Main application port exposed by the container and mapped to the host.

---

*For further customization or troubleshooting, refer to the comments in the provided Dockerfile and docker-compose.yml.*
