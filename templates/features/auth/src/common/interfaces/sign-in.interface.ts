import { SIGN_IN_FIELDS } from '@core/constants';

export type SignIn = Record<
  (typeof SIGN_IN_FIELDS)[keyof typeof SIGN_IN_FIELDS],
  string
>;
