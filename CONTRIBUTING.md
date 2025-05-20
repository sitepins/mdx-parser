# Contributing to MDX Project

Thank you for your interest in contributing to our MDX project! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Setting up the Development Environment
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mdx.git
   cd mdx
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

## Development Workflow

1. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run tests to ensure everything works:
   ```bash
   npm test
   # or
   yarn test
   ```

4. Format your code:
   ```bash
   npm run format
   # or
   yarn format
   ```

## Project Structure

- `src/` - Main source code
  - `core/` - Core MDX parsing and transformation logic
  - `next/` - Next.js specific implementations
  - `types/` - TypeScript type definitions
  - `__test__/` - Test files and fixtures

## Testing

- Write tests for new features in the appropriate `__test__` directory
- Follow existing test patterns
- Ensure all tests pass before submitting a PR

### Running Tests
- Run all tests: `npm test`
- Run specific test suite: `npm test -- path/to/test`

## Pull Request Process

1. Update documentation if needed
2. Add or update tests as required
3. Ensure all tests pass
4. Update the changelog if applicable
5. Submit your PR with a clear description of the changes

### PR Title Format
- feat: Add new feature
- fix: Fix specific issue
- docs: Update documentation
- test: Add or update tests
- chore: Maintenance tasks

## Code Style Guidelines

- Use TypeScript for new code
- Follow existing code formatting patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and concise

## Documentation

- Update documentation for any new features or changes
- Use clear and concise language
- Include code examples where appropriate
- Keep README.md up to date

## Need Help?

If you need help with anything:
- Open an issue for discussion
- Ask questions in pull requests
- Reference existing issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing!