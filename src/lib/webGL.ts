import { type AbstractBaseFunc, Base, type BaseOpts } from './base'

export type WebGLKey = 'webGL' | 'webGL2'

export interface WebGLOpts {
  param: ReturnType<WebGLRenderingContext['getParameter']>
}

export class WebGLHandle extends Base<WebGLOpts, WebGLKey> implements AbstractBaseFunc {
  oriWebGLGetParameter: WebGLRenderingContext['getParameter']
  oriWebGL2GetParameter: WebGL2RenderingContext['getParameter']
  constructor(opts: BaseOpts<WebGLOpts, WebGLKey>) {
    super(opts)
    this.oriWebGLGetParameter = WebGLRenderingContext.prototype.getParameter
    this.oriWebGL2GetParameter = WebGL2RenderingContext.prototype.getParameter
    this.proxy()
  }

  proxy(): void {
    const self = this
    Reflect.defineProperty(WebGLRenderingContext.prototype, 'getParameter', {
      value: new Proxy(WebGLRenderingContext.prototype.getParameter, {
        get: () => {
          self.report('webGL')
          return function (this: WebGLRenderingContext, ...args: Parameters<WebGLRenderingContext['getParameter']>) {
            const debugEx = this.getExtension('WEBGL_debug_renderer_info')
            if (args[0] === debugEx?.UNMASKED_RENDERER_WEBGL) return self.config?.param
            return self.oriWebGLGetParameter.apply(this, args)
          }
        },
      }),
    })

    Reflect.defineProperty(WebGL2RenderingContext.prototype, 'getParameter', {
      value: new Proxy(WebGL2RenderingContext.prototype.getParameter, {
        get: () => {
          self.report('webGL2')
          return function (this: WebGL2RenderingContext, ...args: Parameters<WebGL2RenderingContext['getParameter']>) {
            const debugEx = this.getExtension('WEBGL_debug_renderer_info')
            if (args[0] === debugEx?.UNMASKED_RENDERER_WEBGL) return self.config?.param
            return self.oriWebGL2GetParameter.apply(this, args)
          }
        },
      }),
    })
  }

  restore(): void {
    if (!this.oriWebGLGetParameter) {
      throw new Error(`reset webGL failed. because oriWebGLGetParameter is ${this.oriWebGLGetParameter}.`)
    }

    if (!this.oriWebGL2GetParameter) {
      throw new Error(`reset webGL2 failed. because oriWebGL2GetParameter is ${this.oriWebGL2GetParameter}.`)
    }

    Reflect.defineProperty(WebGLRenderingContext.prototype, 'getParameter', this.oriWebGLGetParameter)
    Reflect.defineProperty(WebGL2RenderingContext.prototype, 'getParameter', this.oriWebGL2GetParameter)
  }
}
