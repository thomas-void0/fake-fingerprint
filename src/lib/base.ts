export abstract class Base<A extends Record<string, any>, B = any> {
  abstract report: (key: B) => void

  protected abstract intercept(): void

  abstract set(conf: A): void

  abstract reset(): void
}
