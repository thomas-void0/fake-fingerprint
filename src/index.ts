import { NavigatorHandle } from './lib/navigator'
import { ScreenHandle } from './lib/screen'
// import { type ConfuseFingerPrintOptions } from './type'

// init all class

const nvHandle = new NavigatorHandle((key) => {
  console.log('key:', key)
})

new ScreenHandle((key) => {
  console.log('screen key:', key)
})

nvHandle.set({
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
})

// export default function (opts: ConfuseFingerPrintOptions) {
//   // const 
//   // // init all class
//   // const { confuseTypes } = opts
//   // if(confuseTypes?.includes('navigator')){
//   // }
  

// }
