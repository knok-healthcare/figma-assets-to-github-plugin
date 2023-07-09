export type VueProp = {
  possibleValues: string[];
  defaultValue: any;
};

export type VuePropMap = {
  [propName: string]: VueProp;
};

export type FigmaComponentProperties = {
  [name: string]: string;
};
