import { type AbstractBaseFunc, Base } from './base'

export type NavigatorReport = {
  type: 'navigator'
  key: keyof Navigator
}

export class NavigatorHandle extends Base<Navigator, NavigatorReport> implements AbstractBaseFunc {
  oriNavigatorDescriptor: ReturnType<typeof Reflect.getOwnPropertyDescriptor>
  constructor(opts: ConstructorParameters<typeof Base<Navigator, NavigatorReport>>[0]) {
    super(opts)
    // cache original navigator descriptor
    this.oriNavigatorDescriptor ||= Reflect.getOwnPropertyDescriptor(window, 'navigator')
  }

  private returnDefaultValue(target: Navigator, key: keyof Navigator) {
    const value = target[key]
    return typeof value === 'function' ? value.bind(target) : value
  }

  proxy() {
    const get = (target: Navigator, key: keyof Navigator) => {
      this.report({ type: 'navigator', key })

      if (this.config) {
        const hasConf = this.config[key]
        return hasConf || this.returnDefaultValue(target, key)
      }

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
