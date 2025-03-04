# Common Components

This directory contains reusable UI components that can be used throughout the application.

## Component Categories

### Auth
- `AuthGuard` - Protects routes that require authentication.

### Loaders
- `ContentLoader` - Displays a loading spinner with customizable height.

### States
- `EmptyState` - Shows a placeholder when no data is available.

### Cards
- `ContentCard` - A card container with consistent styling.
- `StatsCard` - A card for displaying statistical information.

### Headers
- `PageHeader` - A consistent header for page titles and descriptions.

### Tabs
- `FilterTabs` - A tabbed interface for filtering content.

### Layout
- `GridLayout` - A responsive grid layout component.

### Buttons
- `Button` - A customizable button component with multiple variants.

### Badges
- `StatusBadge` - A badge for displaying status information.

### Dropdowns
- `StatusDropdown` - A dropdown menu for selecting statuses.

### Avatars
- `Avatar` - A component for displaying user avatars with fallbacks.

## Usage

You can import components individually:

```tsx
import { Button } from '@/components/common/buttons/Button'
```

Or use the barrel file for cleaner imports:

```tsx
import { Button, Avatar, ContentCard } from '@/components/common'
```

## Best Practices

1. Keep components focused on a single responsibility
2. Use TypeScript interfaces for props
3. Provide sensible defaults
4. Document complex components with comments
5. Make components dark/light mode compatible
6. Consider accessibility in all components 