import { toCamelCase } from "./casing";

export const persistValueToStorage = async ({
  field,
  value,
}: {
  field: string;
  value: any;
}) => {
  await figma.clientStorage.setAsync(field, value);
};

export const getStorage = async () => {
  const exportFormat =
    (await figma.clientStorage.getAsync("exportFormat")) || "default";
  const destinationFolder =
    (await figma.clientStorage.getAsync("destinationFolder")) || "";
  const rtlEnabled =
    (await figma.clientStorage.getAsync("rtlEnabled")) || false;
  const repositoryOwner =
    (await figma.clientStorage.getAsync("repositoryOwner")) || "";
  const repositoryName =
    (await figma.clientStorage.getAsync("repositoryName")) || "";
  const targetBranch =
    (await figma.clientStorage.getAsync("targetBranch")) || "";
  const accessToken = (await figma.clientStorage.getAsync("accessToken")) || "";

  return {
    exportFormat,
    destinationFolder,
    rtlEnabled,
    repositoryOwner,
    repositoryName,
    targetBranch,
    accessToken,
  };
};

export const getAvailablePanels = () => {
  return figma.currentPage.children as ComponentSetNode[];
};

export const getComponentsFromPanel = (panel: ComponentSetNode) => {
  return panel.children as ComponentNode[];
};

// @TODO: Allow the UI to customize the properties to exclude
export const filterComponentProperties = (componentProperties: {
  [name: string]: string;
}) => {
  const filteredProperties = {} as any;

  Object.keys(componentProperties).forEach((key) => {
    if (["Name"].indexOf(key) === -1) {
      filteredProperties[key] = componentProperties[key];
    }
  });

  return filteredProperties;
};

export const componentPropertiesAsConditionString = (componentProperties: {
  [name: string]: string;
}) => {
  let str = "";

  Object.keys(componentProperties).forEach((key) => {
    if (str !== "") str += " && ";

    str += toCamelCase(key) + " === '" + componentProperties[key] + "'";
  });

  return str;
};

export const exportComponentAsSVG = async (component: ComponentNode) => {
  return await component.exportAsync({
    format: "SVG_STRING",
  });
};
