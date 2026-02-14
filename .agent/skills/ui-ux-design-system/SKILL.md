---
name: ui-ux-design-system
description: "Comprehensive component-based UI/UX design system creation using design tokens, consistent atomic components, and scalable theming. Use when designing or refactoring UI systems requiring semantic tokens (color, spacing, typography, radius), component libraries (buttons, cards, modals, forms), Figma-to-code translation, or design system audits for consistency and scalability."
---

# UI/UX Design System Skill

**Activate this skill whenever** the user requests:
- Design system creation or audit
- Component library development
- Design tokens implementation
- Figma/Adobe XD to code conversion
- UI consistency refactoring
- Theming systems (light/dark/brand modes)

## Core Principles

**Always prioritize:**
1. **Token-first design** - Never hardcode values
2. **Atomic components** - Single responsibility, composable
3. **Semantic naming** - `bg-primary` not `blue-500`
4. **Scale over perfection** - 80/20 rule for production-ready systems

## Design Token System (MANDATORY)

### Color Tokens
```css
/* Semantic, not literal */
--color-primary: 223 75% 45%;      /* Brand blue */
--color-primary-muted: 223 75% 65%;
--color-secondary: 30 75% 55%;     /* Accent orange */
--color-neutral: 0 0% 100%;        /* White */
--color-neutral-muted: 0 0% 95%;   /* Off-white */
--color-neutral-dark: 0 0% 10%;    /* Dark gray */
--color-danger: 0 84% 60%;         /* Red */
--color-success: 142 75% 45%;      /* Green */
--color-warning: 45 90% 55%;       /* Yellow */

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  --color-neutral: 0 0% 12%;
  --color-neutral-muted: 0 0% 20%;
}
```

### Spacing Scale (8pt grid)
```css
--space-xs: 0.25rem;  /* 4px  */
--space-sm: 0.5rem;   /* 8px  */
--space-md: 1rem;     /* 16px */
--space-lg: 1.5rem;   /* 24px */
--space-xl: 2rem;     /* 32px */
--space-2xl: 3rem;    /* 48px */
```

### Typography Scale
```css
--font-family-base: 'Inter', -apple-system, sans-serif;
--font-size-xs: 0.75rem;  /* 12px */
--font-size-sm: 0.875rem; /* 14px */
--font-size-base: 1rem;   /* 16px */
--font-size-lg: 1.125rem; /* 18px */
--font-size-xl: 1.25rem;  /* 20px */
--font-size-2xl: 1.5rem;  /* 24px */
--font-size-3xl: 2rem;    /* 32px */
--font-size-4xl: 3rem;    /* 48px */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-loose: 1.7;
```

### Border Radius Scale
```css
--radius-sm: 0.375rem;    /* 6px  */
--radius-md: 0.5rem;      /* 8px  */
--radius-lg: 0.75rem;     /* 12px */
--radius-xl: 1rem;        /* 16px */
--radius-2xl: 1.5rem;     /* 24px */
--radius-full: 9999px;    /* Pill */
```

## Atomic Component Library

### Button Component (Priority 1)
```jsx
// Button.jsx - 6 variants, 4 sizes, loading states
const Button = ({ 
  variant = 'primary',
  size = 'md', 
  loading = false,
  children,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4';
  
  const variants = {
    primary: 'bg-primary text-neutral hover:bg-primary/90 active:bg-primary/80 shadow-lg shadow-primary/25',
    secondary: 'bg-neutral text-neutral-dark hover:bg-neutral-muted border border-neutral-muted/50',
    danger: 'bg-danger text-neutral hover:bg-danger/90',
    ghost: 'hover:bg-neutral-muted/50 active:bg-neutral-muted',
    outline: 'border-2 border-neutral-muted hover:bg-neutral-muted/50'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-md h-9',
    md: 'px-4 py-2 text-sm rounded-lg h-10',
    lg: 'px-6 py-3 text-base rounded-xl h-12',
    xl: 'px-8 py-4 text-lg rounded-2xl h-16'
  };
  
  return (
    <button 
      className={`${base} ${variants[variant]} ${sizes[size]} ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
};
```

### Card Component (Priority 1)
```jsx
// Card.jsx - Glassmorphism-ready, hover states
const Card = ({ children, hoverEffect = true, className = '' }) => (
  <div className={`
    bg-neutral/80 backdrop-blur-sm border border-neutral-muted/50 
    rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
    hover:-translate-y-1 ${hoverEffect ? 'hover:shadow-primary/10' : ''}
    ${className}
  `}>
    {children}
  </div>
);
```

## Workflow Checklist

**When generating design systems:**

1. **Extract tokens first** - Analyze existing designs, create semantic tokens
2. **Build atomic components** - Button → Card → Modal hierarchy
3. **Create theme switcher** - CSS variables + `prefers-color-scheme`
4. **Document component API** - Storybook-style props table
5. **Test responsiveness** - Mobile-first breakpoints
6. **Accessibility audit** - WCAG 2.1 AA compliance

## Output Format
Always deliver:
```
├── design-tokens.css      # Complete token system
├── components/            # Atomic components
│   ├── Button.jsx
│   ├── Card.jsx
│   └── index.js
├── theme-provider.jsx     # Theme wrapper
└── README.md             # Component docs + Figma file
```

**Premium aesthetics achieved through:**
- Subtle glassmorphism (backdrop-filter, rgba backgrounds)
- Perfect 8pt spacing grid
- Semantic color system with hover states
- Smooth micro-transitions (200-300ms)
- Crisp border radius progression
