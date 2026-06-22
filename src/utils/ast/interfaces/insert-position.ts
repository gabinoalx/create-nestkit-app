export type InsertPosition<M> = 'end' | 'start' | { after: M } | { before: M };

export type IdentifierMatcher = { name: string };
export type ObjectMatcher = { property: string; equals: string };

export type IdentifierInsertPosition = InsertPosition<IdentifierMatcher>;
export type ObjectInsertPosition = InsertPosition<
  IdentifierMatcher | ObjectMatcher
>;
