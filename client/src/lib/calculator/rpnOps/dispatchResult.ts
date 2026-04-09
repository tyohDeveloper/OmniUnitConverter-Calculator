type Dims = Record<string, number>;
export type DispatchResult = { value: number; dims: Dims } | null | 'unhandled';
