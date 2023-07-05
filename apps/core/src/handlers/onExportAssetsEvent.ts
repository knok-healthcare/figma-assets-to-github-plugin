import type { ClientStorage } from "../../types/ClientStorage";
import {
  getComponentName,
  getComponentProps,
  getSFCs,
} from "../generators/vue";
import {
  componentPropertiesAsConditionString,
  exportComponentAsSVG,
  filterComponentProperties,
  getAvailablePanels,
  getComponentsFromPanel,
} from "../utils/figma";
import { hasRequiredDataForExport } from "../utils/validators";
import GithubConnector from "github-connector";

export default async (data: ClientStorage) => {
  try {
    hasRequiredDataForExport(data);

    // @TODO: Refactor this code later, consider this as a draft
    let componentsToExport = {} as any;

    const panels = getAvailablePanels();
    figma.currentPage.children as ComponentSetNode[];

    // @TODO: Instead of going to all panels
    // go specifically to the panels selected in the UI
    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const components = getComponentsFromPanel(panel);

      for (let j = 0; j < components.length; j++) {
        const component = panel.children[j] as ComponentNode;
        const svgString = await exportComponentAsSVG(component);

        if (!component.variantProperties || data.exportFormat === "SVG") {
          const componentName = getComponentName(component.name);
          componentsToExport[componentName] = {
            code: svgString,
          };
        } else {
          // has variant properties and is exporting as vue component
          const properties = filterComponentProperties(
            component.variantProperties
          );
          const condition = componentPropertiesAsConditionString(properties);

          const componentName = getComponentName(
            component.variantProperties["Name"]
          );

          if (!componentsToExport[componentName]) {
            componentsToExport[componentName] = {
              code: svgString.replace("<svg", `<svg v-if="${condition}" `),
              props: getComponentProps({}, properties),
            };
          } else {
            componentsToExport[componentName].code +=
              "\n" +
              svgString.replace("<svg", `<svg v-else-if="${condition}" `);

            componentsToExport[componentName].props = getComponentProps(
              componentsToExport[componentName].props,
              properties
            );
          }
        }
      }
    }

    if (data.exportFormat === "Vue") {
      componentsToExport = getSFCs(componentsToExport);
      console.log(componentsToExport);

      const github = new GithubConnector({
        repositoryOwner: data.repositoryOwner,
        repositoryName: data.repositoryName,
        accessToken: data.accessToken,
      });

      const files = await Promise.all(
        Object.keys(componentsToExport).map((componentName: string) => {
          const component = componentsToExport[componentName];

          return github.createFile({
            name: componentName,
            extension: "vue",
            content: component.code,
            encoding: "utf-8",
          });
        })
      );

      const baseBranchName = "main";
      const baseBranch = await github.getBranchByName(baseBranchName);
      if (!baseBranch)
        throw new Error(
          "Specified base branch not found. Make sure the branch exists and try again."
        );

      const fileTree = await github.createFileTree(
        files,
        data.destinationFolder,
        baseBranch?.object.sha
      );

      const commit = await github.createCommit(
        "example message",
        fileTree.sha,
        baseBranch.object.sha
      );

      await github.createOrUpdateBranch(data.targetBranch, commit.sha);

      const pullRequests = await github.getPullRequestsByBranchName(
        data.targetBranch
      );
      if (!pullRequests || pullRequests.length === 0) {
        const createdPullRequest = await github.openPullRequest({
          baseBranch: baseBranchName,
          headBranch: data.targetBranch,
        });
      }
    }
  } catch (error) {
    console.log("error: ", error);
  } finally {
    // figma.closePlugin();
  }
};
