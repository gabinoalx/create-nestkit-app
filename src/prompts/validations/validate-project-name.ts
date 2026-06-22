import validateNpmName from 'validate-npm-package-name';

export const validateProjectName = (
  value: string = '',
): string | Error | undefined => {
  const trimmed = value.trim();
  if (!value || trimmed.length === 0 || typeof value !== 'string')
    return 'El nombre no puede estar vacío';
  const sanitized = value
    .trim()
    .replace(/[<>:"|?*\x00-\x1f]/g, '')
    .replace(/\.\.+/g, '')
    .replace(/\/+|\\+/g, '');

  if (!sanitized)
    return 'El nombre del directorio contiene caracteres inválidos';
  const result = validateNpmName(trimmed);
  if (!result.validForNewPackages) {
    const reason = result.errors?.[0] ?? result.warnings?.[0];
    return reason ?? 'Nombre de paquete no válido';
  }

  return undefined;
};

//todo: probar la validacion con test
