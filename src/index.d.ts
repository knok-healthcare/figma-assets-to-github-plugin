type ExportableComponent = {
  /** The final name of the component that will be exported */
  name: string;
  /** The default component svg code */
  default: string;
  /** A variant is a component property defined in figma (e.g. Size or Type) */
  [variant: string]: string;
};
