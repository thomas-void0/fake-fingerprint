import { Base } from './base'

export class ScreenHandle extends Base<Screen> {
  oriScreenDescriptor: ReturnType<typeof Reflect.getOwnPropertyDescriptor>
  screenConf: Partial<Screen> | null
  report: (key: keyof Screen) => void
  constructor(reportFn: (key: keyof Screen) => void) {
    super()
    this.report = reportFn
    this.screenConf = null
    this.oriScreenDescriptor ||= Reflect.getOwnPropertyDescriptor(window, 'screen')
    this.intercept()
  }

  private returnDefaultValue(target: Screen, key: keyof Screen) {
    const value = target[key]
    return typeof value === 'function' ? (value as Function).bind(target) : value
  }

  protected intercept(): void {
    const get = (target: Screen, key: keyof Screen) => {
      if (this.screenConf) {
        const hasConf = this.screenConf[key]
        return hasConf || this.returnDefaultValue(target, key)
      }

      this.report(key)

      return this.returnDefaultValue(target, key)
    }

    Reflect.defineProperty(window, 'screen', {
      value: new Proxy(window.screen, { get }),
    })
  }

  set(conf: typeof this.screenConf): void {
    this.screenConf = conf
  }

  reset(): void {
    if (!this.oriScreenDescriptor) {
      throw new Error(`reset screen object failed. because oriScreenDescriptor is ${this.oriScreenDescriptor}.`)
    }
    Reflect.defineProperty(window, 'navigator', this.oriScreenDescriptor)
  }
}
