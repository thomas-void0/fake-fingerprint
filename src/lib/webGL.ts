import { type AbstractBaseFunc, Base } from './base'

export interface WebGLOpts {
  param: ReturnType<WebGLRenderingContext['getParameter']>
}

export type WebGLReport = {
  type: 'webGL'
  key: 'WebGLRenderingContext.getParameter' | 'WebGL2RenderingContext.getParameter'
}

export class WebGLHandle extends Base<WebGLOpts, WebGLReport> implements AbstractBaseFunc {
  oriWebGLGetParameter: WebGLRenderingContext['getParameter']
  oriWebGL2GetParameter: WebGL2RenderingContext['getParameter']
  constructor(opts: ConstructorParameters<typeof Base<WebGLOpts, WebGLReport>>[0]) {
    super(opts)
    this.oriWebGLGetParameter = WebGLRenderingContext.prototype.getParameter
    this.oriWebGL2GetParameter = WebGL2RenderingContext.prototype.getParameter
  }

  proxy(): void {
    const self = this

    WebGLRenderingContext.prototype.getParameter = function (
      this: WebGLRenderingContext,
      ...args: Parameters<WebGLRenderingContext['getParameter']>
    ) {
      self.report({ type: 'webGL', key: 'WebGLRenderingContext.getParameter' })
      const debugEx = this.getExtension('WEBGL_debug_renderer_info')
      if (args[0] === debugEx?.UNMASKED_RENDERER_WEBGL) return self.config?.param
      return self.oriWebGLGetParameter.apply(this, args)
    }

    WebGL2RenderingContext.prototype.getParameter = function (
      this: WebGL2RenderingContext,
      ...args: Parameters<WebGL2RenderingContext['getParameter']>
    ) {
      self.report({ type: 'webGL', key: 'WebGL2RenderingContext.getParameter' })
      const debugEx = this.getExtension('WEBGL_debug_renderer_info')
      if (args[0] === debugEx?.UNMASKED_RENDERER_WEBGL) return self.config?.param
      return self.oriWebGL2GetParameter.apply(this, args)
    }
  }

  restore(): void {
    if (!this.oriWebGLGetParameter) {
      throw new Error(`reset webGL failed. because oriWebGLGetParameter is ${this.oriWebGLGetParameter}.`)
    }

    if (!this.oriWebGL2GetParameter) {
      throw new Error(`reset webGL2 failed. because oriWebGL2GetParameter is ${this.oriWebGL2GetParameter}.`)
    }

    WebGLRenderingContext.prototype.getParameter = this.oriWebGLGetParameter
    WebGL2RenderingContext.prototype.getParameter = this.oriWebGL2GetParameter
  }
}
