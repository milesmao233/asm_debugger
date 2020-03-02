import X16BeforePreProcess from '../model/asm-preset/asm-before-pre'

test('define_function main', () => {
    const asm1 = `
    .define_function main
    .args
    .locals x y
`

    const p1 = new X16BeforePreProcess(asm1)
    const output1 = p1.run()
    const expected1 = `@main
set2 a3 4
add2 a3 f1 f1`
    expect(output1).toEqual(expected1)
})

test('define_function multiply', () => {
    const asm1 = `
    .define_function multiply
    .args x y
    .locals i result
`

    const p1 = new X16BeforePreProcess(asm1)
    const output1 = p1.run()
    const expected1 = `@multiply
set2 a3 8
add2 a3 f1 f1`
    expect(output1).toEqual(expected1)

    const output_scope2 = p1.scope
    const expected_scope2 = [
        {
            name: 'multiply',
            args: {
                x: 8,
                y: 6
            },
            locals: {
                i: 4,
                result: 2
            },
            totals: 4
        }
    ]

    expect(output_scope2).toEqual(expected_scope2)
})

test('var locals', () => {
    const asm1 = `
    .define_function main
    .args
    .locals x y res
    .var_local x 5
    .var_local y 4
`

    const p1 = new X16BeforePreProcess(asm1)
    const output1 = p1.run()
    const expected1 = `@main
set2 a3 6
add2 a3 f1 f1
set2 a2 5
.save a2 6
set2 a2 4
.save a2 4`
    expect(output1).toEqual(expected1)

    const output_scope2 = p1.scope
    const expected_scope2 = [
        {
            name: 'main',
            args: {},
            locals: {
                x: 6,
                y: 4,
                res: 2
            },
            totals: 3
        }
    ]

    expect(output_scope2).toEqual(expected_scope2)
})

test('call function', () => {
    const asm1 = `
    .call_function main
`

    const p1 = new X16BeforePreProcess(asm1)
    const output1 = p1.run()
    const expected1 = `.call @main`
    expect(output1).toEqual(expected1)

    const asm2 = `
    .define_function main
    .args
    .locals x y res
    .var_local x 5
    .var_local y 4
    .call_function multiply x y
`

    const p2 = new X16BeforePreProcess(asm2)
    const output2 = p2.run()
    const expected2 = `@main
set2 a3 6
add2 a3 f1 f1
set2 a2 5
.save a2 6
set2 a2 4
.save a2 4
.load 6 a2
.save_param a2 2
.load 4 a2
.save_param a2 4
.call @multiply`
    expect(output2).toEqual(expected2)

    const output_scope2 = p2.scope
    const expected_scope2 = [
        {
            name: 'main',
            args: {},
            locals: {
                x: 6,
                y: 4,
                res: 2
            },
            totals: 3
        }
    ]

    expect(output_scope2).toEqual(expected_scope2)
})

test('test while', () => {
    const asm1 = `
    .define_function multiply
    .args x y
    .locals i result
    .var_local i 1
    .var_local result 0
    .while y > i
`

    const p1 = new X16BeforePreProcess(asm1)
    const output1 = p1.run()
    const expected1 = `@multiply
set2 a3 8
add2 a3 f1 f1
set2 a2 1
.save a2 4
set2 a2 0
.save a2 2
@while_start_multiply
.load 6 a1
.load 4 a2
compare a1 a2
jump_if_less @while_end_multiply`
    expect(output1).toEqual(expected1)
})

test('test if', () => {
    const asm1 = `
    .define_function factorial
    .args x
    .locals n t x2 result

    .var_local n 2
    .if x < n @if_end
    .if_end
`

    const p1 = new X16BeforePreProcess(asm1)
    const output1 = p1.run()
    const expected1 = `@factorial
set2 a3 10
add2 a3 f1 f1
set2 a2 2
.save a2 8
.load 10 a1
.load 8 a2
compare a1 a2
jump_if_less @if_end_factorial
@if_end_factorial`
    expect(output1).toEqual(expected1)
})

test('test .add', () => {
    const asm1 = `
    .define_function multiply
    .args x y
    .locals i result
    .var_local i 1
    .var_local result 0
    .while y > i
    .add2 result x result
`

    const p1 = new X16BeforePreProcess(asm1)
    const output1 = p1.run()
    const expected1 = `@multiply
set2 a3 8
add2 a3 f1 f1
set2 a2 1
.save a2 4
set2 a2 0
.save a2 2
@while_start_multiply
.load 6 a1
.load 4 a2
compare a1 a2
jump_if_less @while_end_multiply
.load 2 a1
.load 8 a2
add2 a1 a2 a2
.save a2 2`
    expect(output1).toEqual(expected1)
})

test('test .subtract', () => {
    const asm1 = `
    .define_function factorial
    .args x
    .locals n t x2 result
    .subtract2 x 1 t
`

    const p1 = new X16BeforePreProcess(asm1)
    const output1 = p1.run()
    const expected1 = `@factorial
set2 a3 10
add2 a3 f1 f1
.load 10 a1
set2 a2 1
subtract2 a1 a2 a2
.save a2 6`
    expect(output1).toEqual(expected1)
})

test('test .return_val', () => {
    const asm1 = `
    .define_function multiply
    .args x y
    .locals i result
    .var_local i 1
    .var_local result 0
    .while y > i
    .add2 result x result
    .add2 i 1 i
    .while_done
    .return_val result
    .end_function multiply
`

    const p1 = new X16BeforePreProcess(asm1)
    const output1 = p1.run()
    const expected1 = `@multiply
set2 a3 8
add2 a3 f1 f1
set2 a2 1
.save a2 4
set2 a2 0
.save a2 2
@while_start_multiply
.load 6 a1
.load 4 a2
compare a1 a2
jump_if_less @while_end_multiply
.load 2 a1
.load 8 a2
add2 a1 a2 a2
.save a2 2
.load 4 a1
set2 a2 1
add2 a1 a2 a2
.save a2 4
jump @while_start_multiply
@while_end_multiply
.load 2 a1
.return 8`
    expect(output1).toEqual(expected1)
})

test('test .shift', () => {
    const asm1 = `
    .define_function main
    .args
    .locals line
    
    .var_local line 63
    
    .shift_right line
`

    const p1 = new X16BeforePreProcess(asm1)
    const output1 = p1.run()
    const expected1 = `@main
set2 a3 2
add2 a3 f1 f1
set2 a2 63
.save a2 2
.load 2 a2
shift_right a2
.save a2 2`
    expect(output1).toEqual(expected1)
})

test('test .and', () => {
    const asm1 = `
    .define_function main
    .args
    .locals line value

    .var_local line 63

    .shift_right line
    .and line 1 value
`

    const p1 = new X16BeforePreProcess(asm1)
    const output1 = p1.run()
    const expected1 = `@main
set2 a3 4
add2 a3 f1 f1
set2 a2 63
.save a2 4
.load 4 a2
shift_right a2
.save a2 4
.load 4 a1
set2 a2 1
and a1 a2 a2
.save a2 2`
    expect(output1).toEqual(expected1)
})

test('test end function', () => {
    const asm1 = `
    .define_function multiply
    .args x y
    .locals i result
    .var_local i 1
    .var_local result 0
    .while y > i
    .add2 result x result
    .add2 i 1 i
    .end_function multiply
`

    const p1 = new X16BeforePreProcess(asm1)
    const output1 = p1.run()
    const expected1 = `@multiply
set2 a3 8
add2 a3 f1 f1
set2 a2 1
.save a2 4
set2 a2 0
.save a2 2
@while_start_multiply
.load 6 a1
.load 4 a2
compare a1 a2
jump_if_less @while_end_multiply
.load 2 a1
.load 8 a2
add2 a1 a2 a2
.save a2 2
.load 4 a1
set2 a2 1
add2 a1 a2 a2
.save a2 4`
    expect(output1).toEqual(expected1)
})
