import { type MutableKeys } from 't2t-tools'
import { type AbstractBaseFunc, Base } from './base'

export interface WebRTCOpts {
  /* eg: 127.0.0.1 */
  address: RTCIceCandidate['address']
}

export type WebRTCReport = {
  type: 'webRTC'
  key: 'candidate'
}

export class WebRTCHandle extends Base<WebRTCOpts, WebRTCReport> implements AbstractBaseFunc {
  oriRTCPeerConnection: typeof RTCPeerConnection
  oriRTCAddEventListener: RTCPeerConnection['addEventListener']
  constructor(opts: ConstructorParameters<typeof Base<WebRTCOpts, WebRTCReport>>[0]) {
    super(opts)
    this.oriRTCPeerConnection = RTCPeerConnection
    this.oriRTCAddEventListener = RTCPeerConnection.prototype.addEventListener
  }

  private handler(target: Record<string | symbol, any>, key: string | symbol) {
    const res = target[key]
    if (!res) return target[key]
    // if prop key is candidate, return new object
    if (key === 'candidate') {
      this.report({
        type: 'webRTC',
        key: 'candidate',
      })
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
    return typeof res === 'function' ? res.bind(target) : res
  }

  proxy(): void {
    const self = this

    RTCPeerConnection.prototype.addEventListener = function (
      this: RTCPeerConnection,
      ...arg: Parameters<RTCPeerConnection['addEventListener']>
    ) {
      if (arg[0] === 'icecandidate') {
        const call = arg[1]
        if (call) {
          arg[1] = (event: Event) => {
            // @ts-expect-error
            call(new Proxy(event, { get: self.handler }))
          }
        }
        return self.oriRTCAddEventListener.apply(this, arg)
      }
      return self.oriRTCAddEventListener.apply(this, arg)
    }

    window.RTCPeerConnection = function (
      this: RTCPeerConnection,
      ...arg: ConstructorParameters<typeof RTCPeerConnection>
    ) {
      const connection =
        this instanceof self.oriRTCPeerConnection
          ? self.oriRTCPeerConnection.apply(this, arg)
          : new self.oriRTCPeerConnection(...arg)

      return new Proxy(connection!, {
        get: (target: RTCPeerConnection, key: keyof RTCPeerConnection) => {
          const res = target[key]
          return typeof res === 'function' ? res.bind(target) : res
        },
        set: (target: RTCPeerConnection, key: keyof MutableKeys<RTCPeerConnection>, value: any) => {
          if (!value) return true
          if (key === 'onicecandidate') {
            target[key] = (event: Event) => {
              value(new Proxy(event, { get: self.handler }))
            }
          } else {
            target[key] = value
          }
          return true
        },
      })
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
