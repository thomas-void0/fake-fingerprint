import { type AbstractBaseFunc, Base } from './base'

export type ScreenKey = keyof Screen

export type ScreenReport = {
  type: 'screen'
  key: keyof Screen
}

export class ScreenHandle extends Base<Screen, ScreenReport> implements AbstractBaseFunc {
  oriScreenDescriptor: ReturnType<typeof Reflect.getOwnPropertyDescriptor>
  constructor(opts: ConstructorParameters<typeof Base<Screen, ScreenReport>>[0]) {
    super(opts)
    this.oriScreenDescriptor ||= Reflect.getOwnPropertyDescriptor(window, 'screen')
  }

  private returnDefaultValue(target: Screen, key: keyof Screen) {
    const value = target[key]
    return typeof value === 'function' ? (value as Function).bind(target) : value
  }

  proxy(): void {
    const get = (target: Screen, key: keyof Screen) => {
      this.report({ type: 'screen', key })

      if (this.config) {
        const hasConf = this.config[key]
        return hasConf || this.returnDefaultValue(target, key)
      }

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
