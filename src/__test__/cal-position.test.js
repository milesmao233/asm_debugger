import log from '../utils/utils'
import {getMachineCode} from '../controller/asm_controller'
import calPosition from '../model/cal-asm/cal-position'

test('calculate position', () => {
    const content = `
    jump @1024
    set2 f1 3
    @function_end
`

    const machineCodes = getMachineCode(content)
    const output = calPosition(content)

    const expected = [1, 1, 1, 2, 2, 2, 2]

    expect(output).toEqual(expected)
})