import { type AbstractBaseFunc, Base, type BaseOpts } from './base'

export type HTCElementProp = typeof HTMLCanvasElement.prototype

export type CanvasKey = 'canvas'

export interface CanvasOpts {
  fillText: Parameters<CanvasRenderingContext2D['fillText']>[0]
}

/**
 * @tips change canvas toDataURL funciton. this will cause the canvas method to be abnormal.
 */
export class CanvasHandle extends Base<CanvasOpts, CanvasKey> implements AbstractBaseFunc {
  oriToDataURL: HTCElementProp['toDataURL']
  constructor(opts: BaseOpts<CanvasOpts, CanvasKey>) {
    super(opts)
    this.oriToDataURL = HTMLCanvasElement.prototype.toDataURL
    this.proxy()
  }

  proxy(): void {
    const get = () => {
      const self = this as CanvasHandle
      return function (this: HTCElementProp, ...args: Parameters<HTCElementProp['toDataURL']>) {
        // repaint
        const internalThis = this
        const ctx = internalThis.getContext('2d')
        if (ctx) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.01)'
          ctx.fillText(self.config?.fillText || '', 0, 2)
        }
        // report invoke
        self.report('canvas')
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
