export interface CONFIG {
  navigator: Navigator
  screen: Screen
}

export type ConfuseTypes = 'navigator' | 'screen' | 'timezone' | 'canvas' | 'audio' | 'webGL' | 'webRTC'

export interface ConfuseFingerPrintOptions {
  /* confuse config such as navigator info or screen info and more. */
  config?: CONFIG
  /* when property or function to be visit. It‘s will be invoke. */
  visitReport?: (type: string) => void
  /* whether random confuse.It will use internal default config info or external incoming config. default false */
  isRandom?: boolean
  /* whether open confuse */
  isOpen?: boolean
  /* need types of confuse, default includes ['navigator', 'screen'] */
  confuseTypes?: ConfuseTypes[]
}
