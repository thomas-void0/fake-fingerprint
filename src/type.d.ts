import { type AudioHandle, type AudioOpts, type AudioReport } from './lib/audio'
import { type CanvasHandle, type CanvasOpts, type CanvasReport } from './lib/canvas'
import { type NavigatorHandle, type NavigatorReport } from './lib/navigator'
import { type ScreenHandle, type ScreenReport } from './lib/screen'
import { type TimezoneHandle, type TimezoneOpts, type TimezoneReport } from './lib/timezone'
import { type WebGLHandle, type WebGLOpts, type WebGLReport } from './lib/webGL'
import { type WebRTCHandle, type WebRTCOpts, type WebRTCReport } from './lib/webRTC'

export type CONFIG = Partial<{
  navigator: Partial<Navigator>
  screen: Partial<Screen>
  canvas: CanvasOpts
  timezone: TimezoneOpts
  audio: AudioOpts
  webGL: WebGLOpts
  webRTC: WebRTCOpts
}>

export type ClassType =
  | typeof NavigatorHandle
  | typeof CanvasHandle
  | typeof ScreenHandle
  | typeof AudioHandle
  | typeof TimezoneHandle
  | typeof WebGLHandle
  | typeof WebRTCHandle

export type ReportKey =
  | AudioReport['key']
  | CanvasReport['key']
  | NavigatorReport['key']
  | ScreenReport['key']
  | TimezoneReport['key']
  | WebGLReport['key']
  | WebRTCReport['key']

export type ReportArg =
  | AudioReport
  | CanvasReport
  | NavigatorReport
  | ScreenReport
  | TimezoneReport
  | WebGLReport
  | WebRTCReport

export interface FakeFingerPrintOptions {
  /* confuse config such as navigator info or screen info and more. */
  config?: CONFIG
  /* when property or function to be visit. It‘s will be invoke. */
  report: (arg: ReportArg) => void
  /* need keys of report. default null, will report all keys */
  reportKeys?: ReportKey[]
}

export interface InstanceRecord {
  key: keyof CONFIG
  instance: InstanceType<ClassType>
  status: 'close' | 'open'
}

export interface KeysStatus {
  close: (keyof CONFIG)[]
  open: (keyof CONFIG)[]
}
