# Money Transfer System

## Description

The Money Transfer System is a robust and secure application designed to facilitate user authentication, fund transfers, and transaction management. Built with [Nest](https://github.com/nestjs/nest), [TypeScript](https://www.typescriptlang.org/), and [PostgreSQL](https://www.postgresql.org/).


## Installation

```bash
$ yarn install
```

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
- **Caching**: In-memory caching (e.g., Redis)
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger

## System Structure
The application is organized into the following core modules:

1. **Auth Module**: Handles user authentication, registration, and token management.
2. **User Module**: Manages user profiles and balances.
3. **Transaction Module**: Facilitates deposits, transfers, and transaction history retrieval.

---

## API Endpoints

### Authentication Endpoints
- **POST /auth/login**
  - Authenticate a user and return a JWT.
- **POST /auth/signup**
  - Register a new user.
- **POST /auth/verify-account**
  - Verify user account via OTP.
- **POST /auth/reset-password**
  - Initiate password reset for a user.

### User Endpoints
- **GET /users/balance**
  - Retrieve the authenticated user's balance.
- **GET /users/:id**
  - Get user profile details by ID.

### Transaction Endpoints
- **POST /transfers**
  - Initiate a money transfer between users.
- **GET /transfers**
  - List the authenticated user's transfers with pagination.
- **POST /deposits**
  - Deposit funds into a user's account.
- **GET /transactions**
  - Retrieve all transactions for a specific user with filtering options (by type, status, and date range).

---

## Error Handling
The system provides comprehensive error handling, ensuring users receive informative messages for various error scenarios, such as not found resources, insufficient funds, and transaction locking issues.

## Caching Mechanism
A simple caching mechanism is implemented for user balances to enhance performance. If a user's balance is cached, it will be returned from the cache; otherwise, it will be fetched from the database and cached for 10 minutes.

## Unit Testing
Unit tests are written for critical business logic and all endpoints to ensure the system's robustness and reliability.

## API Documentation
API documentation is provided using Swagger, making it easy for developers to understand and integrate with the system.

---

# Author

- **Name**: [R. O. Olatunji](https://larexx40.github.io/me/)
- **LinkedIn**: [R Olatunji](https://www.linkedin.com/in/rokeebolatunji/)
- **Email**: [rokeeb.olatunji@gmail.com](mailto:rokeeb.olatunji@gmail.com)


## License

Nest is [MIT licensed](LICENSE).
