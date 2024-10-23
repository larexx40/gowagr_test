# Money Transfer System

## Description

The Money Transfer System is a robust and secure application designed to facilitate user authentication, fund transfers, and transaction management. Built with [Nest](https://github.com/nestjs/nest), [TypeScript](https://www.typescriptlang.org/), and [PostgreSQL](https://www.postgresql.org/).


## Installation

```bash
$ yarn install
```

## Configuration

Before running the application, create a .env file in the root directory of the project. You can use the .env.example file as a reference for the required environment variables.

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test
```

## Docker Setup

The Money Transfer System includes a Docker setup for easier development and deployment. Ensure you have Docker installed on your machine.

```bash
# build and start the containers
$ docker-compose up --build

# to stop the containers
$ docker-compose down
```

## Technologies Used

## [NestJS](https://github.com/nestjs/nest)
<img src="https://docs.nestjs.com/assets/logo-small-gradient.svg" alt="NestJS Logo" width="120" />

NestJS is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications.

---

## [TypeScript](https://www.typescriptlang.org/)
<img src="https://static-production.npmjs.com/255a118f56f5346b97e56325a1217a16.svg" alt="TypeScript Logo" width="120" />

TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.

---

## [PostgreSQL](https://www.postgresql.org/)
<img src="https://www.postgresql.org/media/img/about/press/elephant.png" alt="PostgreSQL Logo" width="120" />

PostgreSQL is a powerful, open-source object-relational database system with more than 15 years of active development.

---

## [TypeORM](https://github.com/typeorm/typeorm)
<img src="https://raw.githubusercontent.com/typeorm/typeorm/master/resources/logo_big.png" alt="TypeORM Logo" width="120" />

TypeORM is an ORM for TypeScript and JavaScript (ES7, ES6, ES5). It supports many databases, including PostgreSQL.



## Key Features
- User authentication and authorization using JWT.
- Secure money transfers between users.
- Deposit funds into user accounts.
- Retrieval of transaction history with filtering and pagination.
- Caching mechanism for improved performance on balance retrieval.
- Detailed API documentation with Swagger for easy integration.

## Technologies Used
- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Caching**: In-memory caching
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger

## System Structure
The application is organized into the following core modules:

1. **Auth Module**: Handles user authentication, registration, and token management.
2. **User Module**: Manages user profiles and balances.
3. **Transaction Module**: Facilitates deposits, transfers, and transaction history retrieval.

---

## API Endpoints

### Authentication Endpoints /auth
- **POST /login**
  - Authenticate a user and return JWT.
- **POST /signup**
  - Register a new user.
- **POST /verify-account**
  - Verify user account via OTP.
- **POST /reset-password**
  - Initiate password reset for a user.

### User Endpoints /user
- **GET /profile**
  - Get authenticated user's profile.
- **GET /balance**
  - Retrieve the authenticated user's balance.
- **GET /users/:username**
  - Get user with username.

### Transaction Endpoints /transactions
- **POST /transfer**
  - Initiate a money transfer between users.
- **GET /transfers**
  - List the authenticated user's transfers with pagination.
- **POST /deposit**
  - Deposit funds into a user's account.
- **GET /transactions**
  - Retrieve all transactions for a specific user with filtering options (by type, status, and date range).

---

## Caching Mechanism
A simple caching mechanism is implemented for user balances to enhance performance. If a user's balance is cached, it will be returned from the cache; otherwise, it will be fetched from the database and cached for 10 minutes.

## Unit Testing
Unit tests are written for critical business logic and all endpoints to ensure the system's robustness and reliability.

## API Documentation
API documentation is provided using Swagger and can be accessed at /api/docs, making it easy for developers to understand and integrate with the system.

## Hosted API
The Money Transfer System API is hosted on [Render](https://render.com).

- **API URL**: [https://gowagr-test.onrender.com](https://gowagr-test.onrender.com)
- **Swagger Documentation**: [https://gowagr-test.onrender.com/api/docs](https://gowagr-test.onrender.com/api/docs)

## TODO
Implement mail sending functionality for send OTP to user's email. The OTP code will be returned in the user data.

---

# Author

- **Name**: [R. O. Olatunji](https://larexx40.github.io/me/)
- **LinkedIn**: [R Olatunji](https://www.linkedin.com/in/rokeebolatunji/)
- **Email**: [rokeeb.olatunji@gmail.com](mailto:rokeeb.olatunji@gmail.com)


## License

Nest is [MIT licensed](LICENSE).
