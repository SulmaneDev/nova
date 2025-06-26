# Contributing to @nova/components

First of all, thank you for taking the time to contribute! 🫱  
We welcome contributions of all kinds — from bug reports to feature suggestions and pull requests.

This guide outlines the standards and process for contributing to the project.

---

## 📦 Project Setup

1. **Fork the repository** and clone your fork:

    ```bash
    git clone https://github.com/your-username/components.git
    cd components
    ```

2. **Build the package**:

    ```bash
    pnpm build
    ```

3. **Run tests to verify setup:**

    ```bash
    pnpm test
    ```

---

## 🌱 Branching Strategy

- All work should happen in a separate **feature branch**:

    ```bash
    git checkout -b comp/foundation
    ```

- Target your pull request against:
  - `develop` for ongoing development.
  - `main` only for stable release PRs (via CI/CD pipeline).

---

## 💬 Issues and Feature Requests

- Use the [GitHub Issues](../../issues) page to:
  - Report a **bug**
  - Request a **feature**
  - Ask a **question**

Please use the provided templates to make your issue as clear as possible.

---

## 🧪 Testing

- All new features must include appropriate **unit tests** using **Jest**.
- Test files are placed under the `tests/` directory and should mirror your source structure.
- Run tests locally before pushing:

    ```bash
    pnpm test
    ```

---

## 🎯 Code Style

We use:

- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [TypeScript strict mode](https://www.typescriptlang.org/tsconfig#strict)

To lint and format your code:

```bash
pnpm lint
pnpm format
```

The project enforces style rules in CI. PRs failing style checks will not be merged.

---

## 📖 Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

Example format:

```
feat(component): add new Button API
fix(core): resolve swc config issue
docs: update README with usage
```

Use `pnpm commit` if [Commitizen](https://github.com/commitizen/cz-cli) is installed, or commit manually following the format.

---

## ✅ Pull Request Guidelines

1. **Fork** → **Feature Branch** → **PR**.
2. Keep your PR focused, minimal, and logically scoped.
3. Reference the related issue (`Closes #123`) in the PR description.
4. Make sure all tests pass.
5. Include tests and documentation updates (if applicable).
6. Wait for review and CI checks to complete.

---

## 🧑‍⚖️ Code of Conduct

We enforce a [Code of Conduct](./CODE_OF_CONDUCT.md) to ensure a welcoming and respectful community.

---

## 🧩 Contributor License Agreement (CLA)

If you're contributing on behalf of a company or organization, you may be asked to sign a Contributor License Agreement. This is common for enterprise contributions.

---

## 🙌 Thank You

Your contributions make this project better. Thank you for being a part of the Novarel ecosystem! 💙
