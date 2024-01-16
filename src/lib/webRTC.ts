import { type AbstractBaseFunc, Base, type BaseOpts } from './base'

export type WebRTKey = 'webRTC'

export interface WebRTCOpts {
  address: RTCIceCandidate['address']
}

export class WebRTCHandle extends Base<WebRTCOpts, WebRTKey> implements AbstractBaseFunc {
  oriRTCPeerConnection: typeof RTCPeerConnection
  oriRTCAddEventListener: RTCPeerConnection['addEventListener']
  constructor(opts: BaseOpts<WebRTCOpts, WebRTKey>) {
    super(opts)
    this.oriRTCPeerConnection = RTCPeerConnection
    this.oriRTCAddEventListener = RTCPeerConnection.prototype.addEventListener
  }

  private handler(target: Record<string | symbol, any>, key: string | symbol) {
    const res = target[key]
    if (!res) return target[key]
    // if prop key is candidate, return new object
    if (key === 'candidate') {
      this.report('webRTC')
      // whether exist ip
      const ipRe = /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/g
      const pubIP = ipRe.exec(res.candidate)?.[0] // original ip
      if (!pubIP) return res

      // modify address of candidate
      const candSplit = res.candidate.split(' ')
      candSplit[4] = this.config?.address

      // return new RTCIceCandidate
      return Reflect.setPrototypeOf(
        {
          ...res.toJSON(),
          candidate: candSplit.join(' '),
          address: this.config?.address,
          foundation: res.foundation,
          component: res.component,
          protocol: res.protocol,
          priority: res.priority,
          port: res.port,
          type: res.type,
          tcpType: res.tcpType,
          relatedAddress: res.relatedAddress,
          relatedPort: res.relatedPort,
        },
        RTCIceCandidate.prototype,
      )
    }
    if (typeof res === 'function') return res.bind(target)
    return res
  }

  proxy(): void {
    const self = this

    RTCPeerConnection.prototype.addEventListener = function (
      ...args: Parameters<RTCPeerConnection['addEventListener']>
    ) {
      if ('icecandidate' == arguments[0]) {
        const call = arguments[1]
        if (call) {
          arguments[1] = (event: Parameters<RTCPeerConnection['addEventListener']>[1]) => {
            call(new Proxy(event, { get: self.handler }))
          }
        }
        return self.oriRTCAddEventListener.apply(this, args)
      }
      return self.oriRTCAddEventListener.apply(this, args)
    }

    window.RTCPeerConnection = function (
      this: RTCPeerConnection,
      ...args: ConstructorParameters<typeof RTCPeerConnection>
    ) {
      const connection =
        this instanceof self.oriRTCPeerConnection
          ? self.oriRTCPeerConnection.apply(this, args)
          : new self.oriRTCPeerConnection(...args)
      return new Proxy(connection!, { get: self.handler })
    } as unknown as typeof RTCPeerConnection
  }

  restore(): void {
    if (!this.oriRTCPeerConnection) {
      throw new Error(`reset RTCPeerConnection failed. because oriRTCPeerConnection is ${this.oriRTCPeerConnection}.`)
    }

    if (!this.oriRTCAddEventListener) {
      throw new Error(
        `reset RTCAddEventListener failed. because oriRTCAddEventListener is ${this.oriRTCAddEventListener}.`,
      )
    }

    window.RTCPeerConnection = this.oriRTCPeerConnection
    RTCPeerConnection.prototype.addEventListener = this.oriRTCAddEventListener
  }
}
