import { Base } from './base'

export class TimezoneHandle extends Base<Navigator> {
  oriNavigatorDescriptor: ReturnType<typeof Reflect.getOwnPropertyDescriptor>
  navigatorConf: Partial<Navigator> | null
  report: (key: keyof Navigator) => void
  constructor(reportFn: (key: keyof Navigator) => void) {
    super()
    this.report = reportFn
    this.navigatorConf = null
    // cache original navigator descriptor
    this.oriNavigatorDescriptor ||= Reflect.getOwnPropertyDescriptor(window, 'navigator')
    this.intercept()
  }

  private returnDefaultValue(target: Navigator, key: keyof Navigator) {
    const value = target[key]
    return typeof value === 'function' ? value.bind(target) : value
  }

  protected intercept() {
    const get = (target: Navigator, key: keyof Navigator) => {
      if (this.navigatorConf) {
        const hasConf = this.navigatorConf[key]
        return hasConf || this.returnDefaultValue(target, key)
      }

      this.report(key)

      return this.returnDefaultValue(target, key)
    }

    Reflect.defineProperty(window, 'navigator', {
      value: new Proxy(window.navigator, { get }),
    })
  }

  set(conf: typeof this.navigatorConf) {
    this.navigatorConf = conf
  }

  reset(): void {
    if (!this.oriNavigatorDescriptor) {
      throw new Error(
        `reset navigator object failed. because oriNavigatorDescriptor is ${this.oriNavigatorDescriptor}.`,
      )
    }
    Reflect.defineProperty(window, 'navigator', this.oriNavigatorDescriptor)
  }
}
