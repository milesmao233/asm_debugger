import log from '../../utils/utils'
import { getMachineCode } from '../../controller/asm_controller'

const calPostion = (content) => {
    const arr = content.split('\n')
    let positions = []
    for (let [i, asm] of arr.entries()) {
        if (asm.includes('jump')) {
            log('asm', asm)
        }
        
        const codes = getMachineCode(asm)
        const codesLen = codes.length
        if ( codesLen !== 0) {
            const a = (new Array(codesLen)).fill(i)
            positions.push.apply(positions, a)
        }
    }
    return positions

    // let i = 0
    // while (i < arr.length) {
    //     let asm = arr[i]
    //     let t = []
    //     if (asm.includes('.define_function')) {
    //         t.push(asm)
    //         const args_asm = arr[i + 1]
    //         t.push(args_asm)
    //         const locals_asm = arr[i + 2]
    //         t.push(locals_asm)

    //         asm = t.join('\n')
    //     }

    //     const codes = getMachineCode(asm)
    //     const codesLen = codes.length
    //     if ( codesLen !== 0) {
    //         const a = (new Array(codesLen)).fill(i)
    //         positions.push.apply(positions, a)
    //     }

    //     if (asm.includes('.define_function')) {
    //         i += 2
    //     }
    //     i += 1
    // }
    // return positions
    
}

export default calPostion