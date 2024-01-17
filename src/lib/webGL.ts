import { type AbstractBaseFunc, Base } from './base'

export interface WebGLOpts {
  /*
    eg: 
    'ANGLE (NVIDIA GeForce GTX 1050 Ti Direct3D11 vs_5_0 ps_5_0)',
    'ANGLE (Intel(R) HD Graphics 630 Direct3D11 vs_5_0 ps_5_0)',
    'ANGLE (Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0)',
    'ANGLE (AMD Radeon(TM) R5 Graphics Direct3D11 vs_5_0 ps_5_0)',
    'ANGLE (NVIDIA GeForce RTX 2070 SUPER Direct3D11 vs_5_0 ps_5_0)',
    'ANGLE (Intel, Intel(R) UHD Graphics 630 (0x00003E9B) Direct3D11 vs_5_0 ps_5_0, D3D11)',
    'Mesa DRI Intel(R) HD Graphics 5500 (Broadwell GT2)',
    'Mesa DRI Intel(R) UHD Graphics 630 (Coffeelake 3x8 GT2)',
    'Mesa DRI Intel(R) Iris(R) Plus Graphics 640 (Kaby Lake GT3e)',
    'AMD Radeon Pro 5300M OpenGL Engine',
    'Intel(R) Iris(R) Plus Graphics OpenGL Engine',
  */
  driver: string
}

export type WebGLReport = {
  type: 'webGL'
  key: 'WebGLRenderingContext.renderDriver' | 'WebGL2RenderingContext.renderDriver'
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
      const debugEx = this.getExtension('WEBGL_debug_renderer_info')
      /* Renderer string of the graphics driver. */
      if (args[0] === debugEx?.UNMASKED_RENDERER_WEBGL) {
        self.report({ type: 'webGL', key: 'WebGLRenderingContext.renderDriver' })
        return self.config?.driver
      }
      return self.oriWebGLGetParameter.apply(this, args)
    }

    WebGL2RenderingContext.prototype.getParameter = function (
      this: WebGL2RenderingContext,
      ...args: Parameters<WebGL2RenderingContext['getParameter']>
    ) {
      const debugEx = this.getExtension('WEBGL_debug_renderer_info')
      /* Renderer string of the graphics driver. */
      if (args[0] === debugEx?.UNMASKED_RENDERER_WEBGL){
        self.report({ type: 'webGL', key: 'WebGL2RenderingContext.renderDriver' })
        return self.config?.driver
      }
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
