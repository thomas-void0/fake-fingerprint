import { type AbstractBaseFunc, Base } from './base'

export interface TimezoneOpts {
  /* eg: 'Asia/Shanghai' | 'America/New_York' | 'Europe/London' */
  zone: Intl.DateTimeFormatOptions['timeZone']
  /* eg: 'zh-CN' 'en-US' 'en-GB'...*/
  locale: Intl.LocalesArgument
  /* offest of time. unit is hour */
  offset: number
}

export type TimezoneReport = {
  type: 'timezone'
  key: 'dateTimeFormat' | 'getTimezoneOffset'
}

export class TimezoneHandle extends Base<TimezoneOpts, TimezoneReport> implements AbstractBaseFunc {
  oriDateTimeFormat: typeof Intl.DateTimeFormat
  oriGetTimezoneOffset: Date['getTimezoneOffset']
  constructor(opts: ConstructorParameters<typeof Base<TimezoneOpts, TimezoneReport>>[0]) {
    super(opts)
    // cache original function
    this.oriDateTimeFormat ||= Intl.DateTimeFormat
    this.oriGetTimezoneOffset ||= Date.prototype.getTimezoneOffset
  }

  proxy() {
    const self = this

    // @ts-expect-error
    Intl.DateTimeFormat = function (
      this: Intl.DateTimeFormat,
      ...args: ConstructorParameters<typeof Intl.DateTimeFormat>
    ) {
      self.report({ type: 'timezone', key: 'dateTimeFormat' })
      args[0] = (self.config?.locale as any) ?? args[0]
      args[1] = { timeZone: self.config?.zone, ...args[1] }
      return self.oriDateTimeFormat.apply(this, args)
    }

    Date.prototype.getTimezoneOffset = function (this: Date) {
      self.report({ type: 'timezone', key: 'getTimezoneOffset' })
      return self.config?.offset != void 0 ? self.config.offset * -60 : self.oriGetTimezoneOffset.apply(this)
    }
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
    Date.prototype.getTimezoneOffset = this.oriGetTimezoneOffset
  }
}
