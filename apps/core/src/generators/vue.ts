import { toCamelCase, toPascalCase } from "../utils/casing";
import type { VuePropMap } from "../../types/VueProps";

// @todo: this needs to be refactored and maybe
// converted into a specific package of the monorepo
// example: "packages/vue-exporter"

export const getComponentName = (name: string) => {
  return toPascalCase(name.replace("/", "Or").replace(".", ""));
};

export const getComponentProps = (
  props: VuePropMap,
  componentProperties: {
    [name: string]: string;
  }
) => {
  Object.keys(componentProperties).forEach((key) => {
    const propertyName = toCamelCase(key);

    if (!props[propertyName]) {
      // @TODO: Allow to customize default values on the plugin UI
      props[propertyName] = {
        possibleValues: [componentProperties[key]],
        defaultValue: componentProperties[key],
      };
    } else {
      if (
        props[propertyName].possibleValues.indexOf(componentProperties[key]) ===
        -1
      ) {
        props[propertyName].possibleValues.push(componentProperties[key]);
      }
    }
  });

  return props;
};

export const componentPropsAsString = (props: VuePropMap) => {
  let propsStr = "";

  Object.keys(props).forEach((propName) => {
    const prop = props[propName];

    if (propsStr !== "") {
      propsStr += ",\n\n";
    }

    propsStr += `    /**\n     * @type {${prop.possibleValues
      .map((v) => `'${v}'`)
      .join(" | ")}}\n     */\n`;

    propsStr +=
      "    " +
      propName +
      ": " +
      "{\n" +
      "      type: String, \n" +
      '      default: "' +
      prop.defaultValue +
      '"\n    }';
  });

  return propsStr;
};

export const newComponentTemplate = () => {
  return `<template>
__COMPONENT_TEMPLATE__
</template>

<script>
export default {
  props: {
__COMPONENT_PROPS__
  }
}
</script>`;
};

export const getSFCs = (components: {
  [componentName: string]: {
    code: string;
    props: VuePropMap;
  };
}) => {
  Object.keys(components).forEach((componentName) => {
    const component = components[componentName];
    let componentCode = newComponentTemplate();

    componentCode = componentCode.replace(
      "__COMPONENT_TEMPLATE__",
      component.code
    );
    componentCode = componentCode.replace(
      "__COMPONENT_PROPS__",
      componentPropsAsString(component.props)
    );

    component.code = componentCode;
  });

  return components;
};
