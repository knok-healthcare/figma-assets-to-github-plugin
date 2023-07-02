export const toCamelCase = (str: string) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
};

export const toPascalCase = (string: string) => {
  const camelCased = toCamelCase(string);
  return camelCased.charAt(0).toUpperCase() + camelCased.slice(1);
};
