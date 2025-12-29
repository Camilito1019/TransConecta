# TransConecta Project

## Overview
TransConecta is a full-stack application that consists of a frontend built with Svelte and a backend powered by TypeScript. This project is designed to be easily deployable using Docker, allowing for a consistent development and production environment.

## Project Structure
The project is organized into the following main directories:

- **frontend**: Contains the Svelte application.
- **backend**: Contains the TypeScript backend application.
- **docker**: Contains environment variable examples for Docker services.
- **docker-compose.yml**: Defines the services and configurations for running the application in Docker containers.

## Prerequisites
- Docker and Docker Compose installed on your machine.
- Basic knowledge of Docker and containerization.

## Getting Started

### 1. Clone the Repository
Clone this repository to your local machine:
```
git clone <repository-url>
cd transconecta-docker
```

### 2. Set Up Environment Variables
Copy the example environment variable files and customize them as needed:
```
cp .env.example .env
cp docker/frontend.env.example docker/frontend.env
cp docker/backend.env.example docker/backend.env
cp docker/postgres.env.example docker/postgres.env
```

### 3. Build and Run the Application
Use Docker Compose to build and run the application:
```
docker-compose up --build
```

This command will build the Docker images for the frontend and backend, and start the services defined in `docker-compose.yml`.

### 4. Access the Application
Once the containers are running, you can access the frontend application at `http://localhost:3000` and the backend API at `http://localhost:4000`.

## Docker Configuration
- **Frontend**: The frontend Dockerfile is located in the `frontend` directory and is responsible for building the Svelte application.
- **Backend**: The backend Dockerfile is located in the `backend` directory and sets up the TypeScript server.
- **PostgreSQL**: A PostgreSQL database is included in the Docker setup, with configuration provided in the `docker/postgres.env.example` file.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.