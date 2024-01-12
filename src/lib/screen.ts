import { type AbstractBaseFunc, Base, type BaseOpts } from './base'

export type ScreenKey = keyof Screen

export class ScreenHandle extends Base<Screen, ScreenKey> implements AbstractBaseFunc {
  oriScreenDescriptor: ReturnType<typeof Reflect.getOwnPropertyDescriptor>
  constructor(opts: BaseOpts<Screen, ScreenKey>) {
    super(opts)
    this.oriScreenDescriptor ||= Reflect.getOwnPropertyDescriptor(window, 'screen')
    this.proxy()
  }

  private returnDefaultValue(target: Screen, key: ScreenKey) {
    const value = target[key]
    return typeof value === 'function' ? (value as Function).bind(target) : value
  }

  proxy(): void {
    const get = (target: Screen, key: ScreenKey) => {
      if (this.config) {
        const hasConf = this.config[key]
        return hasConf || this.returnDefaultValue(target, key)
      }

      this.report(key)

      return this.returnDefaultValue(target, key)
    }

    Reflect.defineProperty(window, 'screen', {
      value: new Proxy(window.screen, { get }),
    })
  }

  restore(): void {
    if (!this.oriScreenDescriptor) {
      throw new Error(`reset screen object failed. because oriScreenDescriptor is ${this.oriScreenDescriptor}.`)
    }
    Reflect.defineProperty(window, 'screen', this.oriScreenDescriptor)
  }
}
