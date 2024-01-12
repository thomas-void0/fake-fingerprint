import { type AbstractBaseFunc, Base, type BaseOpts } from './base'

export interface AudioOpts {
  /* strength of noise */
  strength: GainNode['gain']['value']
}

export type AudioKey = 'audio'

export class AudioHandle extends Base<AudioOpts, AudioKey> implements AbstractBaseFunc {
  oriCreateDynamicsCompressor: OfflineAudioContext['createDynamicsCompressor']
  constructor(opts: BaseOpts<AudioOpts, AudioKey>) {
    super(opts)
    this.oriCreateDynamicsCompressor ||= OfflineAudioContext.prototype.createDynamicsCompressor
    this.proxy()
  }

  proxy() {
    const self = this
    const get = () => {
      return function (
        this: OfflineAudioContext,
        ...args: Parameters<OfflineAudioContext['createDynamicsCompressor']>
      ) {
        const internalThis = this
        const compressor = self.oriCreateDynamicsCompressor.apply(internalThis, args)
        /* create node, add some noise */
        const gain = internalThis.createGain()
        /* strength of noise */
        gain.gain.value = self.config?.strength ?? Math.random() * 0.01
        /* gain connect to compressor */
        compressor.connect(gain)
        /* input connect to context of aim */
        gain.connect(this.destination)
        return compressor
      }
    }

    Reflect.defineProperty(OfflineAudioContext.prototype, 'createDynamicsCompressor', {
      value: new Proxy(OfflineAudioContext.prototype.createDynamicsCompressor, { get }),
    })
  }

  restore() {
    if (!this.oriCreateDynamicsCompressor) {
      throw new Error(
        `reset createDynamicsCompressor failed. because oriCreateDynamicsCompressor is ${this.oriCreateDynamicsCompressor}.`,
      )
    }
    Reflect.defineProperty(OfflineAudioContext.prototype, 'createDynamicsCompressor', this.oriCreateDynamicsCompressor)
  }
}
