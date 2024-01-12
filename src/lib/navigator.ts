import { type AbstractBaseFunc, Base, type BaseOpts } from './base'

export type NavigatorKey = keyof Navigator

export class NavigatorHandle extends Base<Navigator, NavigatorKey> implements AbstractBaseFunc {
  oriNavigatorDescriptor: ReturnType<typeof Reflect.getOwnPropertyDescriptor>
  constructor(opts: BaseOpts<Navigator, NavigatorKey>) {
    super(opts)
    // cache original navigator descriptor
    this.oriNavigatorDescriptor ||= Reflect.getOwnPropertyDescriptor(window, 'navigator')
    this.proxy()
  }

  private returnDefaultValue(target: Navigator, key: NavigatorKey) {
    const value = target[key]
    return typeof value === 'function' ? value.bind(target) : value
  }

  proxy() {
    const get = (target: Navigator, key: NavigatorKey) => {
      if (this.config) {
        const hasConf = this.config[key]
        return hasConf || this.returnDefaultValue(target, key)
      }

      this.report(key)

      return this.returnDefaultValue(target, key)
    }

    Reflect.defineProperty(window, 'navigator', {
      value: new Proxy(window.navigator, { get }),
    })
  }

  restore() {
    if (!this.oriNavigatorDescriptor) {
      throw new Error(
        `reset navigator object failed. because oriNavigatorDescriptor is ${this.oriNavigatorDescriptor}.`,
      )
    }
    Reflect.defineProperty(window, 'navigator', this.oriNavigatorDescriptor)
  }
}
