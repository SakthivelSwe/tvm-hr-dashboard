export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'currency';

export interface TemplateField {
  key: string;
  label: string;
  type: FieldType;
  default?: string;
  hint?: string;
  group?: string;
}

export interface DocTemplate {
  id: string;
  company: string;         // slug e.g. 'tvm'
  docType: string;         // slug e.g. 'offer-letter'
  name: string;
  description: string;
  updated: string;         // ISO date
  html: string;            // uses {{fieldKey}} placeholders
  fields: TemplateField[];
}

export interface DocType {
  slug: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

export interface CompanyFolder {
  slug: string;
  name: string;
  fullName: string;
  logo?: string;              // asset url
  address: string;
  phone: string;
  website: string;
  color: string;              // brand color
  docTypes: DocType[];
}

