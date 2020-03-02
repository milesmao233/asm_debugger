class X16PreProcess {
    constructor(asm) {
        this.asm = asm
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
            if (codes.includes('.call')) {
                const func_name = codes[1]
                l.push(`set2 a3 14`)
                l.push('add2 pa a3 a3')
                l.push('save_from_register2 a3 f1')
                l.push('set2 a3 2')
                l.push('add2 f1 a3 f1')
                l.push(`jump ${func_name}`)
            }
            //
            else if (codes.includes('.save')) {
                const reg_name = codes[1]
                const offset = codes[2]
                l.push(`set2 a3 ${offset}`)
                l.push('subtract2 f1 a3 a3')
                l.push(`save_from_register2 ${reg_name} a3`)
            }
            //
            else if (codes.includes('.load')) {
                const offset = codes[1]
                const reg_name = codes[2]
                l.push(`set2 a3 ${offset}`)
                l.push('subtract2 f1 a3 a3')
                l.push(`load_from_register2 a3 ${reg_name}`)
            }

            //
            else if (codes.includes('.save_param')) {
                const reg_name = codes[1]
                const offset = codes[2]
                l.push(`set2 a3 ${offset}`)
                l.push('add2 f1 a3 a3')
                l.push(`save_from_register2 ${reg_name} a3`)
            }
            //
            else if (codes.includes('.return')) {
                const num = codes[1]
                l.push(`set2 a2 ${num}`)
                l.push('set2 a3 2')
                l.push('add2 a2 a3 a3')
                l.push('subtract2 f1 a3 f1')
                l.push('load_from_register2 f1 a2')
                l.push('jump_from_register a2')
            } else {
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
}

export default X16PreProcess
