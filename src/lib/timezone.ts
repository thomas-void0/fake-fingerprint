import { type AbstractBaseFunc, Base, type BaseOpts } from './base'

export interface TimezoneOpts {
  text: string
  zone: string
  locale: string
  offset: number
}

export type TimezoneKey = 'dateTimeFormat' | 'getTimezoneOffset'

export class TimezoneHandle extends Base<TimezoneOpts, TimezoneKey> implements AbstractBaseFunc {
  oriDateTimeFormat: typeof Intl.DateTimeFormat
  oriGetTimezoneOffset: Date['getTimezoneOffset']
  constructor(opts: BaseOpts<TimezoneOpts, TimezoneKey>) {
    super(opts)
    // cache original function
    this.oriDateTimeFormat ||= Intl.DateTimeFormat
    this.oriGetTimezoneOffset ||= Date.prototype.getTimezoneOffset
  }

  proxy() {
    const self = this
    Reflect.defineProperty(Intl, 'DateTimeFormat', {
      value: new Proxy(Intl.DateTimeFormat, {
        get: () => {
          self.report('dateTimeFormat')
          return function (this: any, ...args: Parameters<typeof Intl.DateTimeFormat>) {
            args[0] = self.config?.locale ?? args[0]
            args[1] = { timeZone: self.config?.zone, ...args[1] }
            return self.oriDateTimeFormat.apply(this, args)
          }
        },
      }),
    })

    Reflect.defineProperty(Date.prototype, 'getTimezoneOffset', {
      value: new Proxy(Date.prototype.getTimezoneOffset, {
        get: () => {
          return function (this: Date) {
            self.report('getTimezoneOffset')
            return self.config?.offset != void 0 ? self.config.offset * -60 : self.oriGetTimezoneOffset.apply(this)
          }
        },
      }),
    })
  }

  restore(): void {
    if (!this.oriDateTimeFormat) {
      throw new Error(`reset timezone failed. because oriDateTimeFormat is ${this.oriDateTimeFormat}.`)
    }

    if (!this.oriGetTimezoneOffset) {
      throw new Error(`reset timezone failed. because oriGetTimezoneOffset is ${this.oriGetTimezoneOffset}.`)
    }
    Reflect.defineProperty(Intl, 'DateTimeFormat', {
      value: this.oriDateTimeFormat,
    })
    Reflect.defineProperty(Date, 'getTimezoneOffset', {
      value: this.oriGetTimezoneOffset,
    })
  }
}
