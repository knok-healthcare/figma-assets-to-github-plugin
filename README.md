<div align="center">

![Figma to Github Plugin Icon](/assets/icons/icon256.svg)

# Figma Assets to Github Plugin

</div>

This plugin adds the ability to export figma assets (icons) to a github repository through a pull request.

[📚 Documentation](https://github.com/knok-healthcare/figma-assets-to-github-plugin/wiki)

---

### Pre-requisites:

- Make sure you have Node installed in your machine (v16.16.0 or higher)
- Make sure you have pnpm installed in you machine (v8.6.5 or higher)
  - To install pnpm run the following command: `npm install -g pnpm`

---

### Getting Started:

**About the repository:**

- This repository implements a **"monorepo"** arquitecture using **pnpm workspaces**.
- There are currently two "apps" inside the monorepo:
  - **Core:** Main business logic of the plugin that runs outside of the UI context (aka the "back-end" of the plugin).
  - **UI:** The plugin UI that the user interacts with. (aka the "front-end" of the plugin).

**Available Commands:**

- Generic:

  - Installing dependencies:

    ```
    pnpm install
    ```

  - Starting the "dev servers":

    ```
    pnpm dev
    ```

  - Build the plugin:

    ```
    pnpm build
    ```

- Targeting a specific app or package:
  - Starting the "dev server" of UI app only:
    ```
    pnpm ui:dev
    ```
  - Building the UI app only:
    ```
    pnpm ui:build
    ```
    **Note:** Pnpm allows to run any scripts defined in the package.json of the packages matched by pnpm-workspace.yaml file. You can run these scripts with the command: `pnpm --filter <package_name> <script>`.

---

### Contribution Guide:

Read our [contribution guide](./CONTRIBUTING.md) for more details on how to contribute to this project.

---

<p align="center">
    <a href="https://knokcare.com">Knok</a>
</p>
