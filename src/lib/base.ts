/* base class */
export interface BaseOpts<C, R extends { type: string; key: string | symbol }> {
  /* need config of change */
  config?: C
  /* when proxy to be visit. It will invoke, key is to be key of visit */
  visitReport?: (reportArg: R) => void
}
export class Base<C, R extends { type: string; key: string | symbol }> {
  protected visitReport: (key: R) => void
  protected config: C | null
  constructor(opts: BaseOpts<C, R>) {
    this.config = opts.config || null
    this.visitReport = opts.visitReport || (() => {})
  }

  /* set current config */
  setConfig(conf: typeof this.config) {
    this.config = conf
  }

  /* get current use config, default is null */
  getConfig() {
    return this.config
  }

  /* when prop to be visit. invoke this function notice user. */
  protected report(arg: R) {
    this.visitReport(arg)
  }
}

/* need function of external realize */
export abstract class AbstractBaseFunc {
  abstract proxy: () => void
  abstract restore: () => void
}
