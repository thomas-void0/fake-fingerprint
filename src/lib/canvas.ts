import { type AbstractBaseFunc, Base } from './base'

export type HTCElementProp = typeof HTMLCanvasElement.prototype

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
  oriToDataURL: HTCElementProp['toDataURL']
  constructor(opts: ConstructorParameters<typeof Base<CanvasOpts, CanvasReport>>[0]) {
    super(opts)
    this.oriToDataURL = HTMLCanvasElement.prototype.toDataURL
  }

  proxy(): void {
    const get = () => {
      const self = this
      return function (this: HTCElementProp, ...args: Parameters<HTCElementProp['toDataURL']>) {
        // report invoke
        self.report({ type: 'canvas', key: 'toDataURL' })
        // repaint
        const internalThis = this
        const ctx = internalThis.getContext('2d')
        if (ctx) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.01)'
          ctx.fillText(self.config?.fillText || '', 0, 2)
        }
        return self.oriToDataURL.apply(internalThis, args)
      }
    }

    Reflect.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
      value: new Proxy(HTMLCanvasElement.prototype.toDataURL, { get }),
    })
  }

  restore(): void {
    if (!this.oriToDataURL) {
      throw new Error(`reset canvas toDataURL failed. because oriToDataURL is ${this.oriToDataURL}.`)
    }
    Reflect.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', this.oriToDataURL)
  }
}
