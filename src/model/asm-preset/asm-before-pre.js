const log = console.log.bind(console)
const isString = v => Object.prototype.toString.call(v) === '[object String]'

class X16BeforePreProcess {
    constructor(asm) {
        this.asm = asm
        this.scope = []
    }

    run() {
        this.process_comment()
        this.pre_process_run()

        return this.asm
    }

    process_comment() {
        const asm = this.asm
        let l = []
        const lines = asm.split('\n')
        for (let line of lines) {
            if (line.includes(';')) {
                const index = line.indexOf(';')
                line = line.slice(0, index)
                l.push(line)
            } else {
                l.push(line)
            }
        }
        const code = l.join('\n')
        this.asm = code
    }

    pre_process_run() {
        // log('this.asm', this.asm)
        const asm = this.asm
        let l = []
        const lines = asm.split('\n')
        const lines_len = lines.length
        let idx = 0

        while (idx < lines_len) {
            if (lines[idx].trim() === '') {
                idx += 1
                continue
            }

            const codes = this.codesSplit(lines[idx])

            if (codes.includes('.define_function')) {
                const func_name = codes[1]

                let d = {
                    name: func_name,
                    args: {},
                    locals: {},
                    totals: 0
                }

                const args_line = lines[idx + 1]
                const args_codes = this.codesSplit(args_line)
                const args_params = args_codes.slice(1)
                const args_nums = args_params.length

                const locals_line = lines[idx + 2]
                const locals_codes = this.codesSplit(locals_line)
                const locals_params = locals_codes.slice(1)
                const locals_nums = locals_params.length

                const total_params = [...args_params, ...locals_params]
                const total_nums = total_params.length

                if (args_params !== 0) {
                    for (let i = 0; i < args_nums; i++) {
                        const arg = args_params[i]
                        d.args[arg] = (total_nums - i) * 2
                    }
                }

                if (locals_params !== 0) {
                    for (let i = 0; i < locals_nums; i++) {
                        const local = locals_params[i]
                        d.locals[local] = (locals_nums - i) * 2
                    }
                }

                d.totals = total_nums

                this.scope.push(d)
                idx += 2

                const offset = total_nums * 2
                l.push(`@${func_name}`)
                l.push(`set2 a3 ${offset}`)
                l.push('add2 a3 f1 f1')
            }
            //
            else if (codes.includes('.var_local')) {
                const local_name = codes[1]
                const local_value = codes[2]
                const local_offset = this.calculate_offset(local_name)

                l.push(`set2 a2 ${local_value}`)
                l.push(`.save a2 ${local_offset}`)
            }
            //
            else if (codes.includes('.load_from_address')) {
                const address_variable = codes[1]
                const val = codes[2]

                const address_offset = this.calculate_offset(address_variable)
                const var_offset = this.calculate_offset(val)
                l.push(`.load ${address_offset} a2`)
                l.push('load_from_register2 a2 a1')
                l.push(`.save a1 ${var_offset}`)
            }
            //
            else if (codes.includes('.call_function')) {
                const function_name = codes[1]
                const args_codes = codes.slice(2)
                const args_codes_len = args_codes.length
                if (args_codes_len != 0) {
                    for (let i = 0; i < args_codes_len; i++) {
                        const offset = this.calculate_offset(args_codes[i])

                        const offset_next_function = (i + 1) * 2
                        l.push(`.load ${offset} a2`)
                        l.push(`.save_param a2 ${offset_next_function}`)
                    }
                }

                l.push(`.call @${function_name}`)
            }

            //
            else if (codes.includes('.while')) {
                const compare_a = codes[1]
                const sign = codes[2]
                const compare_b = codes[3]
                const lastIndex = this.scope.length - 1
                const func_name = this.scope[lastIndex]['name']
                l.push(`@while_start_${func_name}`)

                const offset_a = this.calculate_offset(compare_a)
                const offset_b = this.calculate_offset(compare_b)
                if (sign === '<') {
                    l.push(`.load ${offset_b} a1`)
                    l.push(`.load ${offset_a} a2`)
                } else if (sign === '>') {
                    l.push(`.load ${offset_a} a1`)
                    l.push(`.load ${offset_b} a2`)
                }

                l.push('compare a1 a2')
                l.push(`jump_if_less @while_end_${func_name}`)
            }

            //
            else if (codes.includes('.while_done')) {
                const lastIndex = this.scope.length - 1
                const func_name = this.scope[lastIndex]['name']
                l.push(`jump @while_start_${func_name}`)
                l.push(`@while_end_${func_name}`)
            }

            //
            else if (codes.includes('.if')) {
                const compare_a = codes[1]
                const sign = codes[2]
                const compare_b = codes[3]
                const address = codes[4]
                const lastIndex = this.scope.length - 1
                const func_name = this.scope[lastIndex]['name']
                const addr = `${address}_${func_name}`

                const offset_a = this.calculate_offset(compare_a)
                const offset_b = this.calculate_offset(compare_b)

                if (sign === '>') {
                    l.push(`.load ${offset_b} a1`)
                    l.push(`.load ${offset_a} a2`)
                } else if (sign === '<') {
                    l.push(`.load ${offset_a} a1`)
                    l.push(`.load ${offset_b} a2`)
                }

                l.push('compare a1 a2')
                l.push(`jump_if_less ${addr}`)
            }

            //
            else if (codes.includes('.if_end')) {
                const lastIndex = this.scope.length - 1
                const func_name = this.scope[lastIndex]['name']

                l.push(`@if_end_${func_name}`)
            }

            //
            else if (codes.includes('.add2')) {
                const a = this.process_param_or_num(codes[1])
                const b = this.process_param_or_num(codes[2])
                const into = codes[3]

                this.deal_offset(a, 'a1', l)
                this.deal_offset(b, 'a2', l)

                const offset_into = this.calculate_offset(into)
                l.push('add2 a1 a2 a2')
                l.push(`.save a2 ${offset_into}`)
            }

            //
            else if (codes.includes('.subtract2')) {
                const a = this.process_param_or_num(codes[1])
                const b = this.process_param_or_num(codes[2])
                const into = codes[3]

                this.deal_offset(a, 'a1', l)
                this.deal_offset(b, 'a2', l)

                const offset_into = this.calculate_offset(into)
                l.push('subtract2 a1 a2 a2')
                l.push(`.save a2 ${offset_into}`)
            }

            //
            else if (codes.includes('.return_val')) {
                const val_len = codes.slice(1).length
                if (val_len !== 0) {
                    const n = this.process_param_or_num(codes[1])
                    this.deal_offset(n, 'a1', l)
                }

                const lastIndex = this.scope.length - 1
                const nums = this.scope[lastIndex]['totals'] * 2
                l.push(`.return ${nums}`)
            }

            //
            else if (codes.includes('.assign_return')) {
                const local_name = codes[1]
                const offset = this.calculate_offset(local_name)
                l.push(`.save a1 ${offset}`)
            }

            //
            else if (codes.includes('.shift_right')) {
                const val = codes[1]
                const offset = this.calculate_offset(val)
                l.push(`.load ${offset} a2`)
                l.push('shift_right a2')
                l.push(`.save a2 ${offset}`)
            }

            //
            else if (codes.includes('.and')) {
                const a = this.process_param_or_num(codes[1])
                const b = this.process_param_or_num(codes[2])
                const c = codes[3]

                this.deal_offset(a, 'a1', l)
                this.deal_offset(b, 'a2', l)
                l.push('and a1 a2 a2')
                const offset_c = this.calculate_offset(c)
                l.push(`.save a2 ${offset_c}`)
            } else if (codes.includes('.change_screen_memory')) {
                const index = this.process_param_or_num(codes[1])
                const color = this.process_param_or_num(codes[2])
                this.deal_offset(index, 'a1', l)
                this.deal_offset(color, 'a2', l)

                l.push('set2 a3 3')
                l.push('add2 a3 a1 a3')
                l.push('save_from_register2 a2 a3')
            } else if (codes.includes('.change_screen_memory2')) {
                const index = this.process_param_or_num(codes[1])
                const color = this.process_param_or_num(codes[2])
                this.deal_offset(index, 'a1', l)
                this.deal_offset(color, 'a2', l)

                l.push('set2 a3 32768')
                l.push('add2 a3 a1 a3')
                l.push('save_from_register2 a2 a3')
            }

            //
            else if (codes.includes('.end_function')) {
                this.scope.pop()
            }

            //
            else {
                l.push(lines[idx])
            }

            idx += 1
        }
        const code = l.join('\n')
        this.asm = code
    }

    // split() 效果
    codesSplit(codes) {
        let result = codes.split(' ')
        result = this._deleteTab(result)
        return result
    }

    _deleteTab(codes) {
        return codes.filter(c => c !== '')
    }

    calculate_offset(arg) {
        const lastIndex = this.scope.length - 1
        const d = this.scope[lastIndex]
        let offset = 0
        if (arg in d.args) {
            offset = d['args'][arg]
        } else if (arg in d['locals']) {
            offset = d['locals'][arg]
        }

        return offset
    }

    deal_offset(a, register, lines) {
        if (isString(a)) {
            const offset_a = this.calculate_offset(a)
            lines.push(`.load ${offset_a} ${register}`)
        } else {
            lines.push(`set2 ${register} ${a}`)
        }
    }

    process_param_or_num(tag) {
        const toNum = Number(tag)
        if (isNaN(toNum)) {
            return tag
        } else {
            return toNum
        }
    }
}

export default X16BeforePreProcess
