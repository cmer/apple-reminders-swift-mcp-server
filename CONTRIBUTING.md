# Contributing to Apple Reminders MCP Server

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Getting Started

### Prerequisites

- **macOS 13.0+** (Ventura or later)
- **Node.js 18+**
- **Swift 5.9+** (Xcode Command Line Tools)
- **Git**

### Setup Development Environment

1. **Fork and clone the repository**:
```bash
git clone https://github.com/YOUR_USERNAME/apple-reminders-mcp-server.git
cd apple-reminders-mcp-server
```

2. **Run setup**:
```bash
npm run setup
```

3. **Request Reminders permissions**:
```bash
./swift-cli/.build/release/reminders-cli request-access
```

Grant permission in System Settings > Privacy & Security > Reminders.

## Development Workflow

### Building

```bash
# Build TypeScript only
npm run build

# Build Swift CLI only
npm run build:swift

# Build everything
npm run setup
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Test Swift CLI directly
./swift-cli/.build/release/reminders-cli get-reminders
```

### Linting and Formatting

```bash
# Lint TypeScript
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

### Development Mode

```bash
# Watch mode for TypeScript
npm run dev
```

## Project Structure

```
apple-reminders-mcp-server/
├── src/                    # TypeScript MCP Server
│   ├── index.ts           # MCP server entry point
│   ├── executor/          # Swift CLI executor
│   ├── tools/             # MCP tool handlers
│   │   ├── reminders/     # Reminder operations
│   │   ├── lists/         # List operations
│   │   └── search/        # Search operations
│   ├── validation/        # Zod schemas
│   └── types/             # TypeScript types
├── swift-cli/             # Swift CLI (EventKit integration)
│   ├── Sources/
│   │   ├── RemindersKit/  # Core EventKit library
│   │   └── reminders-cli/ # CLI executable
│   ├── Tests/             # Swift tests
│   └── Package.swift      # Swift package config
└── tests/                 # TypeScript tests
    ├── unit/              # Unit tests
    └── integration/       # Integration tests
```

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - macOS version, Node.js version
   - Relevant logs or error messages

### Suggesting Features

1. **Check existing issues** for similar suggestions
2. **Create a feature request** with:
   - Clear description of the feature
   - Use case and benefits
   - Any implementation ideas
   - Note if it requires EventKit API support

### Submitting Pull Requests

1. **Create an issue** first to discuss significant changes
2. **Fork the repository** and create a branch:
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**:
   - Follow existing code style
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure all tests pass

4. **Commit your changes**:
```bash
git add .
git commit -m "feat: add new feature description"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

5. **Push to your fork**:
```bash
git push origin feature/your-feature-name
```

6. **Create a Pull Request** with:
   - Clear description of changes
   - Link to related issue(s)
   - Screenshots if UI/output changes
   - Test results

## Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for exported functions
- Prefer async/await over promises

Example:
```typescript
/**
 * Creates a new reminder with the specified attributes
 * @param params - Reminder creation parameters
 * @returns The created reminder with ID
 */
export async function createReminder(params: CreateReminderParams): Promise<Reminder> {
  // Implementation
}
```

### Swift

- Follow Swift API Design Guidelines
- Use clear, descriptive names
- Add documentation comments for public APIs
- Use SwiftLint configuration (if added)

Example:
```swift
/// Creates a new reminder in the specified list
/// - Parameters:
///   - title: The reminder title
///   - list: The list to add the reminder to
/// - Returns: The created reminder
func createReminder(title: String, in list: EKCalendar) throws -> EKReminder {
  // Implementation
}
```

## Testing Guidelines

### TypeScript Tests

- Write unit tests for all new tools
- Write integration tests for end-to-end workflows
- Mock Swift CLI responses in unit tests
- Use real Swift CLI in integration tests
- Aim for >80% code coverage

Example:
```typescript
describe('createReminder', () => {
  it('should create a reminder with title', async () => {
    const result = await createReminder({ title: 'Test' });
    expect(result.title).toBe('Test');
  });
});
```

### Swift Tests

- Write unit tests for RemindersKit functions
- Test error handling paths
- Test edge cases (nil values, empty strings, etc.)

## Documentation

- Update README.md for user-facing changes
- Update CONTRIBUTING.md for development changes
- Add JSDoc/Swift doc comments for new APIs
- Include examples in documentation

## EventKit Considerations

### What's Possible

EventKit provides access to most Reminders features:
- CRUD operations
- Recurring reminders
- Location-based reminders
- Multiple alarms
- Priority and flags
- Lists management

### What's Not Possible

Some features use private Apple APIs:
- Native tags (workaround: encode in notes)
- Subtasks (workaround: use notes or separate reminders)
- Smart lists
- New "Urgent" alarms (macOS 15.2+, not in EventKit yet)

When adding features, verify they're supported in EventKit API.

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update README.md with changes
3. Create git tag: `git tag v0.x.0`
4. Push tag: `git push --tags`
5. Create GitHub release with changelog

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an issue with bug template
- **Chat**: Join discussions in GitHub Discussions
- **Security**: Email security@yoursite.com (if applicable)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
