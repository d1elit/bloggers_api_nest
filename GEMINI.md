# GEMINI.md

This file provides a comprehensive overview of the `bloggers-api-nest` project, intended to be used as a context for AI-driven development.

## Project Overview

This is a NestJS-based API for a blogging platform. It is built with TypeScript and follows a clean architecture pattern, separating concerns into `api`, `application`, `domain`, and `infrastructure` layers. The project utilizes MongoDB for its database (via Mongoose) and implements the Command Query Responsibility Segregation (CQRS) pattern for handling business logic.

### Key Technologies & Libraries:

*   **Framework:** NestJS
*   **Language:** TypeScript
*   **Database:** MongoDB with Mongoose
*   **Architecture:** Clean Architecture, CQRS
*   **API Documentation:** Swagger (inferred from `app.setup.ts`)
*   **Validation:** `class-validator`, `class-transformer`
*   **Authentication:** JWT (`jsonwebtoken`)

### Module Structure:

The application is divided into several key modules:

*   `CoreModule`: Contains shared components, configuration (`CoreConfig`), exception filters, and custom decorators.
*   `BloggersPlatformModule`: The main business module, managing blogs and posts. This module is where the CQRS pattern is most evident, with distinct commands, queries, and handlers.
*   `UserAccountsModule`: Handles user registration, authentication, and user data management.
*   `TestingModule`: A utility module, likely for clearing data during e2e tests.

## Building and Running

### Installation

```bash
pnpm install
```

### Running the Application

```bash
# Development mode with watch
pnpm run start:dev

# Production mode
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

### Running Tests

```bash
# Run all unit tests
pnpm run test

# Run end-to-end (e2e) tests
pnpm run test:e2e

# Get test coverage report
pnpm run test:cov
```

## Development Conventions

### Coding Style

*   **Formatting:** The project uses Prettier for code formatting. To format all files, run:
    ```bash
    pnpm run format
    ```
*   **Linting:** ESLint is configured for code quality and style checking. To lint and automatically fix issues, run:
    ```bash
    pnpm run lint
    ```

### Architecture

The project adheres to a strict architectural pattern:

*   **Controllers (`api`):** Handle incoming HTTP requests, validate input using DTOs, and dispatch commands or queries to the `CommandBus` or `QueryBus`. They should remain lean.
*   **Services/Use Cases (`application`):** Contain the core application logic. Use cases are triggered by controllers and orchestrate the domain layer to fulfill the request.
*   **Domain Entities (`domain`):** Represent the core business objects and contain the business rules. They are persistence-ignorant.
*   **Repositories (`infrastructure`):** Mediate between the domain and the data persistence layer (MongoDB). They are responsible for saving and retrieving domain entities.
*   **Query Repositories (`infrastructure/query`):** Provide methods to query the database and return data tailored for specific views (DTOs), bypassing the domain model for read operations, as per CQRS.

### Testing

*   **Unit Tests:** `.spec.ts` files located alongside the source files in the `src` directory.
*   **End-to-End Tests:** `.e2e-spec.ts` files located in the `test` directory.
*   The project uses Jest as the testing framework. Configuration can be found in `package.json` (`jest` key) and `test/jest-e2e.json`.
