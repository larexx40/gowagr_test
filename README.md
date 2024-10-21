<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

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
![NestJS Logo](https://raw.githubusercontent.com/nestjs/docs/master/src/assets/logo-small.png)

NestJS is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications.

---

## [TypeScript](https://www.typescriptlang.org/)
![TypeScript Logo](https://raw.githubusercontent.com/microsoft/TypeScript/main/logo/logo.png)

TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.

---

## [PostgreSQL](https://www.postgresql.org/)
![PostgreSQL Logo](https://www.postgresql.org/media/img/about/pglogo.png)

PostgreSQL is a powerful, open-source object-relational database system with more than 15 years of active development.

---

## [TypeORM](https://github.com/typeorm/typeorm)
![TypeORM Logo](https://typeorm.io/img/typeorm_logo.png)

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
