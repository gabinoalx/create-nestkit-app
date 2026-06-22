import type { Feature } from '../../interfaces/feature.js';

export const dockerFeature: Feature = {
  id: 'docker',
  label: 'Docker (Dockerfile + compose)',
  templateDir: 'docker',
  // sin dependencies: Docker no añade paquetes npm
  // sin apply: solo copia archivos, no modifica código existente
};
