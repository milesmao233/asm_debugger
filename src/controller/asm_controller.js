import X16Preset from '../model/asm-preset/index'
import MachineCode from '../model/asm'

const getMachineCode = (asm) => {
    // console.log('asm', asm)
    const presetedAsm = X16Preset(asm)
    const mc = new MachineCode(presetedAsm)
    const codes = mc.process()
    return codes
}

export {
    getMachineCode
}