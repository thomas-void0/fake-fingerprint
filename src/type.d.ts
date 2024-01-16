import { type AudioHandle, type AudioOpts } from './lib/audio'
import { type CanvasHandle, type CanvasOpts } from './lib/canvas'
import { type NavigatorHandle } from './lib/navigator'
import { type ScreenHandle } from './lib/screen'
import { type TimezoneHandle, type TimezoneOpts } from './lib/timezone'
import { type WebGLHandle, type WebGLOpts } from './lib/webGL'
import { type WebRTCHandle, type WebRTCOpts } from './lib/webRTC'

export interface CONFIG {
  navigator: Navigator
  screen: Screen
  canvas: CanvasOpts
  timezone: TimezoneOpts
  audio: AudioOpts
  webGL: WebGLOpts
  webRTC: WebRTCOpts
}

export type ClassType =
  | typeof NavigatorHandle
  | typeof CanvasHandle
  | typeof ScreenHandle
  | typeof AudioHandle
  | typeof TimezoneHandle
  | typeof WebGLHandle
  | typeof WebRTCHandle

export interface FakeFingerPrintOptions {
  /* confuse config such as navigator info or screen info and more. */
  config?: CONFIG
  /* when property or function to be visit. It‘s will be invoke. */
  visitReport?: (type: string) => void
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
