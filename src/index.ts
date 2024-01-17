import { AudioHandle } from './lib/audio'
import { CanvasHandle } from './lib/canvas'
import { NavigatorHandle } from './lib/navigator'
import { ScreenHandle } from './lib/screen'
import { TimezoneHandle } from './lib/timezone'
import { WebGLHandle } from './lib/webGL'
import { WebRTCHandle } from './lib/webRTC'
import {
  type CONFIG,
  type ClassType,
  type FakeFingerPrintOptions,
  type InstanceRecord,
  type KeysStatus,
  type ReportArg,
} from './type'
// import {  } from 't2t-tools'

const ClassMap = new Map<keyof CONFIG, ClassType>([
  ['navigator', NavigatorHandle],
  ['screen', ScreenHandle],
  ['audio', AudioHandle],
  ['canvas', CanvasHandle],
  ['timezone', TimezoneHandle],
  ['webGL', WebGLHandle],
  ['webRTC', WebRTCHandle],
])

// read options, init class
export default class FakeFingerPrint {
  private opts: FakeFingerPrintOptions
  private instanceRecords: InstanceRecord[]
  constructor(options: FakeFingerPrintOptions) {
    this.opts = options
    this.instanceRecords = []
  }

  /* report visit of key */
  private internalReport(arg: ReportArg) {
    if (!this.opts) {
      return
    }

    const { reportKeys } = this.opts

    if (!reportKeys || reportKeys.includes(arg.key)) {
      this.opts.report?.(arg)
    }
  }

  /* update config */
  set(conf: CONFIG) {
    if (!conf) {
      throw new TypeError('argument of set function can not be empty.')
    }

    this.opts.config = conf
    ;(Reflect.ownKeys(conf) as (keyof CONFIG)[]).forEach((key: keyof CONFIG) => {
      const record = this.instanceRecords.find((record) => record.key === key)
      record && record.instance.setConfig(conf[key] as any)
    })
  }

  /* get current run types of instance  */
  getKeysStatus() {
    const result: KeysStatus = {
      close: [],
      open: [],
    }
    this.instanceRecords.forEach((ins) => {
      const key = ins.key
      ins.status === 'close' ? result.close.push(key) : result.open.push(key)
    })

    return result
  }

  /* close fake */
  close(keys?: (keyof CONFIG)[]) {
    this.instanceRecords.forEach((ins) => {
      if ((!keys || keys?.includes(ins.key)) && ins.status === 'open') {
        ins.instance.restore()
        ins.status = 'close'
      }
    })
  }

  /* open fake */
  open(keys?: (keyof CONFIG)[]) {
    const newInstanceRecords: InstanceRecord[] = []
    for (const [key, Cls] of ClassMap.entries()) {
      const record = this.instanceRecords.find((ins) => ins.key === key)
      if (!keys || keys?.includes(key)) {
        if (record && record.status === 'close') {
          record.instance.proxy()
          record.status = 'open'
          break
        }
        const newInstance = new Cls({
          config: this.opts.config?.[key] as any,
          visitReport: this.internalReport.bind(this),
        })
        newInstance.proxy()
        newInstanceRecords.push({
          key,
          instance: newInstance,
          status: 'open',
        })
      }
    }

    this.instanceRecords = this.instanceRecords.concat(newInstanceRecords)
  }
}

const instance = new FakeFingerPrint({
  config: {
    // navigator: { userAgent: 'gaga' },
    // screen: {
    //   width: 9999,
    //   height: 88,
    // },
    // canvas: {
    //   fillText: 'gaga梦',
    // },
    // audio: {
    //   strength: 100,
    // },
    // timezone: {
    //   zone: 'America/New_York',
    //   locale: 'en-US',
    //   offset: -5,
    // },
    // webGL: {
    //   driver: 'ANGLE (NVIDIA GeForce GTX 1050 Ti Direct3D11 vs_5_0 ps_5_0)',
    // },
    // webRTC: {
    //   address: '192.23.14.123',
    // },
  },
  report: (arg) => {
    console.log('key:', arg)
  },
})

instance.open(['webRTC'])
