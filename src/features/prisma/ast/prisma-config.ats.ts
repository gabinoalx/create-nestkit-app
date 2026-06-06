import { type PropertyAssignment, SyntaxKind, type Project } from "ts-morph";

export const configurePrismaConfig = (
  project: Project,
  filePath: string,
): void => {
  const file = project.addSourceFileAtPath(filePath);

  const destructuring = `
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, DB_SCHEMA } = process.env;
`;
  const dbUrl = `const DB_URL = \`postgresql://\${DB_USER}:\${DB_PASSWORD}@\${DB_HOST}:\${DB_PORT}/\${DB_NAME}?schema=\${DB_SCHEMA}\`;`;
  const imports = file.getImportDeclarations();
  const lastImport = imports.at(-1);
  const insertIndex = lastImport ? lastImport.getChildIndex() + 1 : 0;
  file.insertStatements(insertIndex, [destructuring, dbUrl]);

  const exportDefault = file.getExportAssignmentOrThrow(() => true);
  const callExpr = exportDefault.getFirstDescendantByKindOrThrow(
    SyntaxKind.CallExpression,
  );
  const configObj = callExpr.getFirstDescendantByKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );

  const schemaProp = configObj.getPropertyOrThrow(
    "schema",
  ) as PropertyAssignment;
  schemaProp.setInitializer('"prisma"');

  const datasourceProp = configObj.getPropertyOrThrow("datasource");
  const urlProp = datasourceProp
    .getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression)
    .getPropertyOrThrow("url") as PropertyAssignment;

  urlProp.setInitializer("DB_URL");
};
