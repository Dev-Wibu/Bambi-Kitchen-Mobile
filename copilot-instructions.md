# React Native Expo App – AI Agent Guide

> TL;DR: This is an Expo React Native project with TypeScript, Tailwind (NativeWind), and React Query. Use **npm/yarn/pnpm** commands and Expo CLI for development. The app supports iOS, Android, and Web platforms.

## Big Picture (read once)

1. **App Structure** – all source code lives under the root directory. Features should be organized in logical folders (`components/`, `services/`, `contexts/`, `hooks/`, etc.).
2. **Routing** – Uses Expo Router with file-based routing. Routes are defined in the `app/` directory.
3. **Networking** – API integration through `@tanstack/react-query` with OpenAPI TypeScript generation (`schema-from-be.d.ts`).
4. **State Management** – Zustand for global state, React Query for server state, and MMKV for persistent storage.
5. **UI Components** – TailwindCSS via NativeWind + RN Primitives. Styled components in `components/` directory.
6. **Type Safety** – Full TypeScript integration with backend schema generation via `openapi-typescript`.

## Daily Commands

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Start development server
npm start
# or
expo start

# Platform-specific development
npm run ios     # Start iOS simulator
npm run android # Start Android emulator
npm run web     # Start web development

# Code quality
npm run lint   # ESLint checking
npm run format # Prettier formatting

# Type generation from backend
npm run generate-schema # Generate TypeScript types from OpenAPI spec
```

Before running any command, ensure dependencies are installed and synchronized.

## Development Guidelines

### Code Organization

- **Components** = PascalCase for React components, camelCase for utilities
- **File Structure** = Group related files together in feature-based folders
- **Imports** = Use absolute imports when possible for better maintainability
- **Exports** = Prefer named exports over default exports for better tree-shaking

### React Native Specific

- Use `@expo/vector-icons` for consistent iconography
- Leverage `expo-*` packages for native functionality (camera, storage, etc.)
- Handle platform differences with `Platform.OS` when necessary
- Use `SafeAreaView` or `useSafeAreaInsets` for proper screen boundaries
- Optimize lists with `@shopify/flash-list` instead of standard FlatList

### Styling & UI

- **NativeWind** = Use Tailwind classes for styling React Native components
- **Responsive Design** = Consider different screen sizes and orientations
- **Dark Mode** = Support system appearance preferences
- **Accessibility** = Include proper accessibility props (`accessibilityLabel`, etc.)

### Data Management

- **API Calls** = Always use React Query hooks, never direct fetch calls
- **State Management** = Use Zustand for global app state
- **Persistence** = Use MMKV for fast, secure local storage
- **Forms** = Leverage `react-hook-form` for form validation and management

### Performance

- **Images** = Use `expo-image` for optimized image handling
- **Navigation** = Implement proper navigation patterns with Expo Router
- **Bundle Size** = Monitor and optimize bundle size for faster app startup
- **Memory** = Be mindful of memory usage, especially with large lists and images

## Tech Stack Integration

### Core Dependencies

- **Expo SDK** = Main framework for React Native development
- **TypeScript** = Full type safety across the application
- **NativeWind** = Tailwind CSS for React Native styling
- **React Query** = Server state management and caching
- **Zustand** = Client-side state management
- **Expo Router** = File-based routing system

### Development Tools

- **ESLint** = Code linting and quality enforcement
- **Prettier** = Code formatting and consistency
- **OpenAPI TypeScript** = Backend schema to TypeScript type generation

## Best Practices

### API Integration

- Regenerate TypeScript types after any backend schema changes
- Use React Query for all server interactions to maintain cache coherence
- Implement proper error handling and loading states
- Consider offline functionality with React Query's persistence

### Code Quality

- Write type-safe code with proper TypeScript annotations
- Follow React Native performance best practices
- Implement proper error boundaries for crash prevention
- Use meaningful component and variable names

### Testing (when applicable)

- Write unit tests for utility functions and hooks
- Consider integration tests for critical user flows
- Test on multiple platforms (iOS, Android, Web) when targeting all
- Use proper mocking for external services and APIs

### Security

- Secure sensitive data with proper encryption (MMKV supports encryption)
- Validate all user inputs and API responses
- Implement proper authentication and authorization flows
- Keep dependencies updated for security patches

## Platform Considerations

### Cross-Platform Development

- Test features across all target platforms
- Handle platform-specific UI differences gracefully
- Use Expo's platform-specific file extensions when needed (`.ios.tsx`, `.android.tsx`)
- Consider web-specific optimizations when targeting web platform

### Native Features

- Use Expo managed workflow when possible for easier deployment
- Implement proper permissions handling for device features
- Consider offline functionality and network state handling
- Optimize for different device sizes and capabilities

## Deployment & Distribution

### Development Builds

- Use Expo Development Builds for custom native code
- Test on physical devices regularly, not just simulators
- Implement proper environment variable management

### Production

- Follow Expo's build and submission guidelines
- Implement proper app versioning and update strategies
- Consider over-the-air updates with Expo Updates
- Monitor app performance and crash reporting

---

## Customization Notes

This template is designed to be flexible and adaptable. Common areas for customization:

- **Authentication** = Implement your preferred auth strategy (OAuth, JWT, etc.)
- **Navigation** = Customize navigation structure based on app requirements
- **UI Theme** = Adapt color schemes, typography, and component styles
- **API Integration** = Update schema generation URL and API base configuration
- **State Structure** = Design Zustand stores based on your app's data needs
- **Feature Modules** = Organize components and services by business domain

_Update this file when project structure, dependencies, or workflows change._
