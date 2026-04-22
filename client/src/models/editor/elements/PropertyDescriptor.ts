export type PropertyEditorType = 
"string" | "number" | "boolean" | "checkbox" | "colorpicker" | "bittoggle"


export interface IEditableProperty {
  label: string;
  key: string;
  type: PropertyEditorType;
  readonly?: boolean;
  validate?: (value: any) => boolean;
}