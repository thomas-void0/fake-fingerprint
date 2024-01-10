export type ReportFn<T> = (key: keyof T) => void
export abstract class Base<C extends Record<string, any>> {
  abstract report: ReportFn<C>

  protected abstract intercept(): void

  abstract set(conf: C): void

  abstract reset(): void
}
