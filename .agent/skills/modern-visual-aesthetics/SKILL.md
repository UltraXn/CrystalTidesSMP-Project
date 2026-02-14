---
name: modern-visual-aesthetics
description: "Premium modern visual aesthetics implementation featuring glassmorphism, neumorphism variants, advanced gradients, dark mode mastery, and cinematic micro-animations. Use for high-end landing pages, dashboards, SaaS apps, or any project requiring 2026-era visual sophistication with buttery-smooth interactions."
---

# Modern Visual Aesthetics Skill

**Activate for:** Glassmorphism, neumorphism, advanced gradients, dark mode systems, scroll-triggered animations, parallax effects, premium dashboards, SaaS interfaces.

## Glassmorphism Foundation (2026 Standard)

### Perfect Glass Effect
```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.37),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
```

### Dark Glass Variant
```css
.glass-dark {
  background: rgba(20, 20, 30, 0.7);
  backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

## Advanced Gradient Palettes

### Primary Brand Gradient (Animated)
```css
.gradient-primary {
  background: 
    radial-gradient(ellipse at top left, hsl(223, 90%, 45%) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, hsl(30, 90%, 55%) 0%, transparent 50%),
    linear-gradient(135deg, hsl(223, 75%, 45%) 0%, hsl(30, 75%, 55%) 50%, hsl(223, 75%, 35%) 100%);
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

### Hero Section Background
```css
.hero-bg {
  background: 
    linear-gradient(145deg, hsl(223, 80%, 20%) 0%, hsl(240, 70%, 10%) 50%, hsl(260, 60%, 8%) 100%),
    radial-gradient(circle at 20% 80%, hsl(223, 90%, 15%) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, hsl(30, 90%, 20%) 0%, transparent 50%);
  min-height: 100vh;
}
```

## Micro-Animation System

### Hover Lift Effect
```css
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.hover-lift:active {
  transform: translateY(-4px) scale(1.01);
}
```

### Scroll Reveal (Intersection Observer)
```javascript
// scroll-reveal.js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  observer.observe(el);
});
```

## Dark Mode Mastery

### Seamless Theme Switch
```css
:root {
  --bg-primary: 0 0% 100%;
  --bg-secondary: 0 0% 98%;
  --text-primary: 0 0% 10%;
}

[data-theme="dark"] {
  --bg-primary: 240 10% 5%;
  --bg-secondary: 240 10% 10%;
  --text-primary: 0 0% 98%;
}

/* Smooth transition */
* { transition: background-color 0.3s, color 0.3s, border-color 0.3s; }
```

## Premium Component Examples

### Stats Card (Glassmorphism)
```jsx
const StatsCard = ({ number, label, trend }) => (
  <div className="glass p-8 rounded-3xl text-center group hover:glass-dark">
    <div className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
      {number}
    </div>
    <div className="text-neutral-dark/80 text-lg font-medium">{label}</div>
    <div className="mt-4 text-sm opacity-75">{trend}</div>
    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
  </div>
);
```

### Floating Action Button
```jsx
const FAB = ({ icon, onClick }) => (
  <button className="
    fixed bottom-8 right-8 w-16 h-16 rounded-full
    bg-gradient-to-br from-primary to-secondary
    shadow-2xl hover:shadow-primary/50
    hover:scale-110 active:scale-95
    transition-all duration-300
  ">
    {icon}
  </button>
);
```

## Implementation Priority
1. **Glassmorphism base** - All cards, modals, sidebars
2. **Gradient backgrounds** - Hero, feature sections
3. **Micro-interactions** - Hover lifts, loading states
4. **Dark mode** - Full token coverage
5. **Scroll animations** - Staggered reveals
