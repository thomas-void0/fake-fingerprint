import { type AbstractBaseFunc, Base } from './base'

export type CanvasReport = {
  type: 'canvas'
  key: 'toDataURL'
}

export interface CanvasOpts {
  fillText: Parameters<CanvasRenderingContext2D['fillText']>[0]
}

/**
 * @tips change canvas toDataURL funciton. this will cause the canvas method to be abnormal.
 */
export class CanvasHandle extends Base<CanvasOpts, CanvasReport> implements AbstractBaseFunc {
  oriToDataURL: HTMLCanvasElement['toDataURL']
  constructor(opts: ConstructorParameters<typeof Base<CanvasOpts, CanvasReport>>[0]) {
    super(opts)
    this.oriToDataURL = HTMLCanvasElement.prototype.toDataURL
  }

  proxy(): void {
    const self = this
    HTMLCanvasElement.prototype.toDataURL = function (
      this: HTMLCanvasElement,
      ...args: Parameters<HTMLCanvasElement['toDataURL']>
    ) {
      // report invoke
      self.report({ type: 'canvas', key: 'toDataURL' })
      // repaint
      const ctx = this.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.01)'
        ctx.fillText(self.config?.fillText || '', 0, 2)
      }
      return self.oriToDataURL.apply(this, args)
    }
  }

  restore(): void {
    if (!this.oriToDataURL) {
      throw new Error(`reset canvas toDataURL failed. because oriToDataURL is ${this.oriToDataURL}.`)
    }
    HTMLCanvasElement.prototype.toDataURL = this.oriToDataURL
  }
}
