# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ticketon is a NestJS application built with TypeScript, TypeORM, and MySQL. The project follows Clean Architecture principles with a strong emphasis on separation of concerns through layered architecture.

## Development Commands

### Running the Application
```bash
npm run start:dev    # Development mode with watch
npm run start        # Standard development mode
npm run start:prod   # Production mode
npm run build        # Build the project
```

### Testing
```bash
npm run test              # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Run tests with coverage
npm run test:e2e          # Run end-to-end tests
npm run test:debug        # Debug tests
```

To run a single test file:
```bash
npm run test -- path/to/test.spec.ts
```

### Code Quality
```bash
npm run lint      # Run ESLint with auto-fix
npm run format    # Format code with Prettier
```

### Database Migrations
```bash
# Create a new migration manually
npx typeorm migration:create ./src/migrations/YourMigrationName

# Generate migration from entity changes
npm run migration:generate -- ./src/migrations/YourMigrationName

# Run migrations
npx typeorm-ts-node-commonjs migration:run -d ./src/data-source.ts

# Revert last migration
npm run migration:revert
```

## Architecture

### Layered Architecture Pattern

The codebase follows a **Clean Architecture** approach with clear separation between layers. Each feature module is organized into distinct layers:

#### Module Structure
```
src/
├── [feature]/
│   ├── domain/              # Business logic layer
│   │   ├── entity/          # Domain entities (TypeORM entities)
│   │   └── interface/       # Repository interfaces (domain contracts)
│   ├── usecase/             # Application business rules
│   │   ├── dto/
│   │   │   ├── input/       # Use case input DTOs
│   │   │   └── output/      # Use case output DTOs
│   │   └── test/            # Use case unit tests
│   ├── external/            # External layer (frameworks & adapters)
│   │   ├── dto/             # API DTOs (with validation decorators)
│   │   └── repository/      # Repository implementations
│   │       └── fakes/       # Fake repositories for testing
│   ├── [feature].controller.ts  # HTTP controllers
│   ├── [feature].module.ts      # NestJS module definition
│   └── [feature].token.ts       # DI tokens for providers
├── common/                  # Shared code across features
│   ├── entities/            # Base entity classes
│   └── interfaces/          # Shared interfaces (IUseCase, IBaseRepository)
└── migrations/              # TypeORM migrations
```

### Key Architectural Concepts

1. **Use Case Pattern**: Business logic is encapsulated in use cases that implement `IUseCase<Input, Output>` interface with a single `run(input)` method.

2. **Repository Pattern**: Data access is abstracted through repository interfaces in the domain layer, with concrete implementations in the external layer.

3. **Dependency Injection with Tokens**: Each feature defines string tokens (e.g., `UserRepositoryToken`, `CreateUserToken`) used for DI registration in the module.

4. **DTO Separation**:
   - **External DTOs** (in `external/dto/`): API-facing DTOs with class-validator decorators for request validation
   - **Use Case DTOs** (in `usecase/dto/`): Internal DTOs used by business logic

5. **Base Classes**:
   - `BaseEntity`: Provides common fields (id, createdAt, updatedAt) for all entities
   - `PartialClass<T>`: Helper class for DTOs that accepts partial data in constructor

6. **Testing Strategy**:
   - Use cases have unit tests using fake repositories (no database)
   - Fake repositories are located in `external/repository/fakes/`
   - E2E tests are in the `test/` directory

### Creating a New Feature Module

When adding a new feature, follow this pattern (using "users" as a reference):

1. **Create directory structure**: `src/[feature]/domain/entity/`, `src/[feature]/domain/interface/`, `src/[feature]/usecase/`, `src/[feature]/external/`

2. **Define domain entity** extending `BaseEntity`

3. **Define repository interface** in `domain/interface/`

4. **Create use cases** implementing `IUseCase<Input, Output>`

5. **Implement repository** in `external/repository/`

6. **Create fake repository** in `external/repository/fakes/` for testing

7. **Define DI tokens** in `[feature].token.ts`

8. **Create controller** for HTTP endpoints

9. **Set up module** with providers mapped to tokens

10. **Write unit tests** for use cases using fake repositories

## Configuration

- **Environment Variables**: Configured via `.env` file, loaded globally through `ConfigModule`
- **Database**: MySQL connection configured in `src/data-source.ts` using environment variables
- **TypeORM**: Entity discovery via glob pattern, synchronize is disabled (migrations required)

## Important Notes

- **Module Registration**: Always register entities in both the app module (`app.module.ts`) and feature module using `TypeOrmModule.forFeature([Entity])`
- **Default Exports**: The codebase uses default exports for classes (entities, use cases, repositories, controllers)
- **Strict Null Checks**: TypeScript strict null checks are enabled
- **Test Coverage**: Coverage excludes main.ts, module files, entities, and interfaces
