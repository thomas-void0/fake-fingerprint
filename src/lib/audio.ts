import { type AbstractBaseFunc, Base } from './base'

export interface AudioOpts {
  /* strength of noise */
  strength: GainNode['gain']['value']
}

export type AudioReport = {
  type: 'audio'
  key: 'createDynamicsCompressor'
}

export class AudioHandle extends Base<AudioOpts, AudioReport> implements AbstractBaseFunc {
  oriCreateDynamicsCompressor: OfflineAudioContext['createDynamicsCompressor']
  constructor(opts: ConstructorParameters<typeof Base<AudioOpts, AudioReport>>[0]) {
    super(opts)
    this.oriCreateDynamicsCompressor ||= OfflineAudioContext.prototype.createDynamicsCompressor
  }

  proxy() {
    const self = this
    OfflineAudioContext.prototype.createDynamicsCompressor = function (
      this: OfflineAudioContext,
      ...args: Parameters<OfflineAudioContext['createDynamicsCompressor']>
    ) {
      self.report({ type: 'audio', key: 'createDynamicsCompressor' })
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

  restore() {
    if (!this.oriCreateDynamicsCompressor) {
      throw new Error(
        `reset audio createDynamicsCompressor failed. because oriCreateDynamicsCompressor is ${this.oriCreateDynamicsCompressor}.`,
      )
    }

    OfflineAudioContext.prototype.createDynamicsCompressor = this.oriCreateDynamicsCompressor
  }
}
