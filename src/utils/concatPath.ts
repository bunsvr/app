type TrimEndPath<P extends string> = P extends `${infer C}/` ? C : P;
type AddStartPath<P extends string> = P extends `/${infer C}` ? `/${C}` : `/${P}`;

/**
 * Normalize a path
 */
type Normalize<P extends string> = TrimEndPath<AddStartPath<P>> extends '' ? '/' : TrimEndPath<AddStartPath<P>>;

/**
 * Concat path
 */
export type ConcatPath<A extends string, B extends string> = Normalize<`${Normalize<A>}${Normalize<B>}`>;
