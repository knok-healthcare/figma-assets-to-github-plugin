# Figma Assets to Github Plugin

This plugin adds the ability to export figma assets (icons) to a github repository through a pull request.

---

### Demo

@TODO: Demo video exporting assets to a dummy repository

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

- Global:

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

@TODO: Contribution guide

@TODO: License file

@TODO: Convert repository to public

@TODO: Implement repository security policies

@TODO: Deployment automations

---

<p align="center">
    <a href="https://knokcare.com">Knok</a>
</p>
