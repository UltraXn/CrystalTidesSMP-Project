---
name: ux-interaction-design
description: "Advanced UX interaction design focusing on intuitive user flows, WCAG 2.2 AAA accessibility, progressive disclosure, skeleton loading, haptic feedback simulation, and contextual micro-interactions. Use for complex user journeys, accessible dashboards, onboarding flows, form validation patterns, and enterprise-grade interaction systems."
---

# UX Interaction Design Skill

**Activate for:** User flows, accessibility implementation, loading states, form patterns, onboarding sequences, progressive disclosure, error recovery, keyboard navigation.

## User Flow Architecture

### Progressive Disclosure Framework
```
1. Zero State → Empty with CTA
2. Skeleton Loading → Structured placeholders
3. Content Reveal → Staggered animations
4. Empty State → Actionable next steps
5. Error State → Clear recovery path
6. Success State → Brief celebration + next action
```

### Skeleton Loading System
```jsx
const Skeleton = ({ className = '', width = 'full', height = 'h-12' }) => (
  <div className={`
    ${width === 'full' ? 'w-full' : 'w-24'} ${height}
    bg-neutral-muted animate-pulse rounded-lg
    ${className}
  `} />
);

// Usage pattern
const LoadingCard = () => (
  <div className="space-y-4">
    <Skeleton height="h-6" width="w-3/4" />
    <Skeleton height="h-4" width="w-1/2" />
    <div className="flex gap-2">
      <Skeleton height="h-12" width="w-20" />
      <Skeleton height="h-12" width="w-20" />
    </div>
  </div>
);
```

## Accessibility Mastery (WCAG 2.2 AAA)

### Focus Management
```jsx
// useFocusTrap.js
import { useEffect, useRef } from 'react';

export const useFocusTrap = (active = true) => {
  const ref = useRef();
  
  useEffect(() => {
    if (!active) return;
    
    const focusable = ref.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    
    const handleKeydown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    first?.focus();
    
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [active]);
};
```

### Screen Reader Patterns
```jsx
// ARIA Live Region for dynamic content
const LiveRegion = ({ message, polite = true, assertLive = false }) => {
  const ref = useRef();
  
  useEffect(() => {
    if (message && ref.current) {
      ref.current.textContent = message;
      if (assertLive) ref.current.setAttribute('aria-live', 'assertive');
    }
  }, [message]);
  
  return (
    <div 
      ref={ref}
      role="status"
      aria-live={polite ? 'polite' : 'assertive'}
      aria-atomic="true"
      className="sr-only"
    />
  );
};
```

## Form Interaction Patterns

### Progressive Form Validation
```jsx
const FormField = ({ label, error, children }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-neutral-dark">
      {label}
    </label>
    <div className="relative">
      {children}
    </div>
    {error && (
      <p className="text-xs text-danger mt-1 animate-in slide-in-from-top-2">
        {error}
      </p>
    )}
  </div>
);
```

## Micro-Interaction System

### Button Press Feedback
```css
.pressable {
  --press-scale: 0.96;
  transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}

.pressable:active {
  transform: scale(var(--press-scale));
}
```

## User Flow Templates

### Onboarding Flow (5-Step)
```jsx
const OnboardingFlow = () => {
  const steps = [
    { title: 'Welcome', subtitle: 'Get started in 2 minutes' },
    { title: 'Connect', subtitle: 'Link your accounts' },
    { title: 'Customize', subtitle: 'Personalize your experience' },
    { title: 'Explore', subtitle: 'See what’s possible' },
    { title: 'Done!', subtitle: 'You’re all set ✨' }
  ];
  
  return (
    <div className="max-w-md mx-auto p-8">
      {/* Progress dots, step content, back/next CTAs */}
    </div>
  );
};
```

## Accessibility Checklist (MANDATORY)
- [ ] **Keyboard navigation** - Tab order logical, visible focus
- [ ] **Screen reader** - ARIA labels, live regions
- [ ] **Color contrast** - 4.5:1 minimum (AAA)
- [ ] **Motion reduction** - `prefers-reduced-motion`
- [ ] **Focus management** - Trap modals, restore on close
- [ ] **Form labels** - Associated with inputs
- [ ] **Loading states** - ARIA live updates

**Output always includes:**
- Flow diagram (Mermaid syntax)
- Component interaction code
- Accessibility audit report
- Keyboard navigation demo
