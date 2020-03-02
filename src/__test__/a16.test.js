// import path from 'path'
// import fs from 'fs'
// import X16Preset from '../model/asm-preset/index'
// import MachineCode from '../model/asm'
// import AxePU16 from '../model/virtual_machine'

// test('test multiply.a16', () => {
//     const p = path.resolve(__dirname, 'a16/multiply.a16')
//     const asm = fs.readFileSync(p, 'utf-8', 'r')
//     const asm_formal = X16Preset(asm)

//     const machine = new MachineCode(asm_formal)
//     const code = machine.process()
//     const codeLen = code.length
//     const zeroLen = 2 ** 16 - codeLen
//     const memory = [...code, ...Array(zeroLen).fill(0)]
//     const cpu = new AxePU16(memory)
//     cpu.run()
//     const output = cpu.registers['a1']
//     const expected = 20

//     expect(output).toEqual(expected)
// })


// test('test factorial.a16', () => {
//     const p = path.resolve(__dirname, 'a16/factorial.a16')
//     const asm = fs.readFileSync(p, 'utf-8', 'r')
//     const asm_formal = X16Preset(asm)

//     const machine = new MachineCode(asm_formal)
//     const code = machine.process()
//     const codeLen = code.length
//     const zeroLen = 2 ** 16 - codeLen
//     const memory = [...code, ...Array(zeroLen).fill(0)]
//     const cpu = new AxePU16(memory)
//     cpu.run()
//     const output = cpu.registers['a1']
//     const expected = 120

//     expect(output).toEqual(expected)
// })

test('all done', () => {
    
})