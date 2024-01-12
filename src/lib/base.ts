/* base class */
export interface BaseOpts<C, K> {
  /* need config of change */
  config?: C
  /* when proxy to be visit. It will invoke, key is to be key of visit */
  visitReport?: (key: K) => void
  /* need keys of report. default null, will report all keys */
  reportKeys?: K[]
}
export class Base<C, K> {
  protected visitReport: (key: K) => void
  protected config: C | null
  protected reportKeys: K[] | null
  constructor(opts: BaseOpts<C, K>) {
    this.config = opts.config || null
    this.visitReport = opts.visitReport || (() => {})
    this.reportKeys = opts.reportKeys || null
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
  protected report(key: K) {
    const keys = this.reportKeys
    if (!keys || keys?.includes(key)) {
      this.visitReport(key)
    }
  }
}

/* need function of external realize */
export abstract class AbstractBaseFunc {
  abstract proxy: () => void
  abstract restore: () => void
}
