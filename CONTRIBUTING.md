# Contribution Guide

Thank you for investing your time in contributing to our project! Please don't forget to read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Issues

If you had an idea, found a bug or want to propose a new feature please open a new issue in this repository. The issue should explain the idea/bug concisely and with as much detail as possible.

## Commits

This repository follows the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/#specification) for writing commit messages. We use this specification to help us generate proper release changelogs.

- Allowed commit prefixes are:
  - `feat`, `fix`, `docs`, `chore`, `build`, `ci`, `perf`, `style`, `refactor`, `revert`, `test`.
- Identify the scope whenever possible:
  - example: `feat(github-connector): pull request creation logic`
- Identify breaking changes (exclamation mark):
  - example: `feat!(vue-extractor): extract components with completely changed API`

## Pull Requests

Pull requests are the best way to propose changes to the codebase and are always welcome.

Before submiting your code for review:
- make sure you tested it manually
- wrote the necessary unit or e2e tests
- make sure the code was linted and doesn't introduce unnecessary warnings
- wrote/updated documentation

## License

When you submit code changes, you agree that your submissions are understood to be under the same [MIT License](./LICENSE) that covers this project. Feel free to contact us if that's a concern for you.
