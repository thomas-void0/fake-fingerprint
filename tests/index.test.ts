// @vitest-environment jsdom
import { describe, expect, it, test, vi } from 'vitest'
import FakeFingerPrint from '../src'

const instance = new FakeFingerPrint({ report: () => {} })

describe(`test open function of 'fakeFingerPrint' `, () => {
  const open = vi.spyOn(instance, 'open')
  ;[
    ['navigator', 'screen'],
    ['screen'],
    ['canvas'],
    ['canvas', 'timezone'],
    ['canvas', 'timezone', 'navigator'],
  ].forEach((arg) => {
    it(`test open ${arg.join(',')}`, () => {
      instance.open(arg as Parameters<FakeFingerPrint['open']>[0])
      expect(open.mock.calls.length).toBeTruthy()
    })
  })
})

describe(`test close function of 'fakeFingerPrint' `, () => {
  const close = vi.spyOn(instance, 'close')
  ;[
    null,
    ['navigator', 'screen'],
    ['screen'],
    ['canvas'],
    ['canvas', 'timezone'],
    ['canvas', 'timezone', 'navigator'],
  ].forEach((arg) => {
    it(`test close ${arg?.join(',')}`, () => {
      instance.close(arg as Parameters<FakeFingerPrint['close']>[0])
      expect(close.mock.calls.length).toBeTruthy()
    })
  })
})

describe(`test getKeysStatus function of 'fakeFingerPrint' `, () => {
  it('test getKeysStatus when non open keys', () => {
    const instance = new FakeFingerPrint({ report: () => {} })
    expect(instance.getKeysStatus()).toStrictEqual({
      close: [],
      open: [],
    })
  })

  it.skip(`test getKeysStatus when keys is 'audio', 'webGL','webRTC'`, () => {
    const instance = new FakeFingerPrint({
      report: () => {},
      config: {
        audio: {
          strength: 100,
        },
        webGL: {
          driver: 'ANGLE (NVIDIA GeForce GTX 1050 Ti Direct3D11 vs_5_0 ps_5_0)',
        },
        webRTC: {
          address: '127.0.0.1',
        },
      },
    })
    instance.open(['audio', 'webGL', 'webRTC'])
    expect(instance.getKeysStatus()).toStrictEqual({
      close: [],
      open: ['audio', 'webGL', 'webRTC'],
    })
  })

  it(`test getKeysStatus when keys is 'navigator', 'screen'`, () => {
    const instance = new FakeFingerPrint({ report: () => {} })
    instance.open(['navigator', 'screen'])
    expect(instance.getKeysStatus()).toStrictEqual({
      close: [],
      open: ['navigator', 'screen'],
    })
  })

  it(`test getKeysStatus when keys is 'canvas', 'timezone'`, () => {
    const instance = new FakeFingerPrint({
      report: () => {},
      config: { navigator: { userAgent: 'test', appName: '123' } },
    })
    instance.open(['canvas', 'timezone'])
    expect(instance.getKeysStatus()).toStrictEqual({
      close: [],
      open: ['canvas', 'timezone'],
    })
  })

  it(`test getKeysStatus when close 'navigator' and 'screen'`, () => {
    const instance = new FakeFingerPrint({ report: () => {} })
    instance.open(['navigator', 'screen', 'canvas', 'timezone'])
    instance.close(['navigator', 'screen'])
    expect(instance.getKeysStatus()).toStrictEqual({
      close: ['navigator', 'screen'],
      open: ['canvas', 'timezone'],
    })
  })
})

describe(`test set function of 'fakeFingerPrint' `, () => {
  const set = vi.spyOn(instance, 'set')
  test('test set config', () => {
    instance.set({
      navigator: {
        userAgent: 'Custom UA',
      },
      screen: {
        width: 9999,
        height: 88,
      },
      canvas: {
        fillText: 'hello fake',
      },
      audio: {
        strength: 100,
      },
      timezone: {
        zone: 'America/New_York',
        locale: 'en-US',
        offset: -5,
      },
      webGL: {
        driver: 'ANGLE (NVIDIA GeForce GTX 1050 Ti Direct3D11 vs_5_0 ps_5_0)',
      },
      webRTC: {
        address: '127.0.0.1',
      },
    })
    expect(set.mock.calls.length).toBeTruthy()
  })
})
