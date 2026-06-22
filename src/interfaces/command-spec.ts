export type CommandSpec =
  | {
      run: 'dlx';
      autoConfirm?: boolean;
      package: string;
      args?: readonly string[];
    }
  | { run: 'script'; script: string; args?: readonly string[] }
  | { run: 'bin'; file: string; args?: readonly string[] };
