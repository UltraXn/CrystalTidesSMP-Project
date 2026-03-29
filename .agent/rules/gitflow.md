# GitFlow & PR Rules

## Branch Strategy
- **main**: Stable production branch. Only merges from `develop`.
- **develop**: Pre-production / Integration branch. All features and fixes target this branch.
- **feature/**: New features. Branched from `develop`.
- **bugfix/** or **fix/**: Non-security bug fixes. Branched from `develop`.
- **security/**: Security patches and hardening. Branched from `develop`.

## Pull Request Requirements
- **Target Branch**: Always target `develop`.
- **CI/CD States**: All checks (ESLint, Tests, Security scans) MUST pass before merging.
- **Review**: At least one approval is required for `develop` -> `main` or critical fixes.
- **Atomic Commits**: Use descriptive commit messages following Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`).

## Merge Protocol
1. Ensure `develop` is up to date: `git pull origin develop`.
2. Merge feature branch into `develop` with a merge commit (no-ff) or squash.
3. Verify local build and tests pass before pushing.
