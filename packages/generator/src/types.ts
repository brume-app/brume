export interface GeneratedFile {
  path: string;
  content: string;
}

export interface GenerationIssue {
  path: (string | number)[];
  message: string;
}

export type GenerateResult =
  | { ok: true; files: GeneratedFile[] }
  | { ok: false; issues: GenerationIssue[] };
