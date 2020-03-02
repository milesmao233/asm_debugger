import X16BeforePreProcess from './asm-before-pre'
import X16PreProcess from './asm-pre-process'

const X16Preset = asm => {
    let r = new X16BeforePreProcess(asm).run()
    r = new X16PreProcess(r).run()

    return r
}

export default X16Preset
