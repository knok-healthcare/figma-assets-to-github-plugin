export type VueProp = {
  possibleValues: string[];
  defaultValue: any;
};

export type VuePropMap = {
  [propName: string]: VueProp;
};
