---
name: dart
description: Expert Dart development for Flutter and backend applications, focusing on idiomatic code, performance, and best practices.
---
# Dart Skill

Master Dart for Flutter apps, server-side (Dart Frog/Aqueduct), and CLI tools. Follow these modular behaviors:

## Core Principles
- Use **null safety** everywhere; prefer `?` only when required.
- Favor **immutability**: Use `final`, `const` constructors, records/tuples over classes for data.
- Write **async/await** idiomatically; avoid raw Futures unless streaming.

## Modular Behaviors
- **Project Setup**: Run `dart create --template=flutter my_app` for Flutter; use `dart pub add` for deps. Always `dart format .` and `dart analyze`.
- **State Management**: Use **Riverpod** (preferred over Bloc/Provider). Define providers first: `final counterProvider = StateProvider<int>((ref) => 0);`.
- **UI Development**: StatelessWidget by default. Use `const` constructors. Extract widgets for >20 lines. Prefer `ListView.builder` over `ListView`.
- **Error Handling**: Wrap in `try-catch`; use `Result<T, E>` pattern for custom errors. Never ignore errors.
- **Testing**: 80% coverage minimum. Use `flutter test` with `mockito` for mocks. Golden tests for UI.
- **Performance**: Use `const` everywhere possible. Profile with Flutter DevTools. Avoid `setState` in loops.
- **Packages**: Prefer official `dart:` libs → `package:flutter` → pub.dev with >1k likes. Audit deps weekly.
