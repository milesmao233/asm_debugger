class MachineCode {
    constructor(asm) {
        this.asm = asm
        this.regs = {
            'pa': 0b00000000,
            'a1': 0b00010000,
            'a2': 0b00100000,
            'a3': 0b00110000,
            'c1': 0b01000000,
            'f1': 0b01010000,
        }
    }

    process() {
        let memory = []
        const regs = this.regs
        const lines = this.asm.split('\n')
        let label_address = {}
        let offset = 0
        
        for (let line of lines) {
            if (line.trim() === '') {
                continue
            }
            let codes = line.split(' ')
            codes = this._deleteTab(codes)
            const op = codes[0]
            if (op === 'set') {
                offset += 3
                const reg = codes[1]
                const r = regs[reg]
                const value = Number(codes[2]) & 0x00ff
                memory.push(0)
                memory.push(r)
                memory.push(value)
            }

            else if (op === 'set2') {
                offset += 4
                const reg = codes[1]
                const r = regs[reg]
                const value = Number(codes[2])
                const [low, high] = this.get_high_low(value)
                memory.push(8)
                memory.push(r)
                memory.push(low)
                memory.push(high)
            }

            else if (op === 'load') {
                offset += 4
                const address = Number(codes[1].slice(1))
                const [lowAddress, highAddress] = this.get_high_low(address)
                const reg = codes[2]
                const r = regs[reg]
                memory.push(1)
                memory.push(lowAddress)
                memory.push(highAddress)
                memory.push(r)
            }

            else if (op === 'load2') {
                offset += 4
                const address = Number(codes[1].slice(1))
                const [lowAddress, highAddress] = this.get_high_low(address)
                const reg = codes[2]
                const r = regs[reg]
    
                memory.push(9)
                memory.push(lowAddress)
                memory.push(highAddress)
                memory.push(r)
            }

            else if (op === 'add') {
                offset += 4
                const reg1 = codes[1]
                const reg2 = codes[2]
                const reg3 = codes[3]
                const r1 = regs[reg1]
                const r2 = regs[reg2]
                const r3 = regs[reg3]
                memory.push(2)
                memory.push(r1)
                memory.push(r2)
                memory.push(r3)
            }

            else if (op === 'add2') {
                offset += 4
                const reg1 = codes[1]
                const reg2 = codes[2]
                const reg3 = codes[3]
                const r1 = regs[reg1]
                const r2 = regs[reg2]
                const r3 = regs[reg3]
                memory.push(10)
                memory.push(r1)
                memory.push(r2)
                memory.push(r3)
            }

            else if (op === 'save') {
                offset += 4
                const reg = codes[1]
                const r = regs[reg]
                const address = Number(codes[2].slice(1))
                const [lowAddress, highAddress] = this.get_high_low(address)
    
                memory.push(3)
                memory.push(r)
                memory.push(lowAddress)
                memory.push(highAddress)
            }

            else if (op === 'save2') {
                offset += 4
                const reg = codes[1]
                const r = regs[reg]
                const address = Number(codes[2].slice(1))
                const [lowAddress, highAddress] = this.get_high_low(address)
    
                memory.push(11)
                memory.push(r)
                memory.push(lowAddress)
                memory.push(highAddress)
            }

            else if (op === 'subtract2') {
                offset += 4
                const reg1 = codes[1]
                const reg2 = codes[2]
                const reg3 = codes[3]
                const r1 = regs[reg1]
                const r2 = regs[reg2]
                const r3 = regs[reg3]
                memory.push(12)
                memory.push(r1)
                memory.push(r2)
                memory.push(r3)
            }

            else if (op === 'save_from_register') {
                offset += 3
                const reg1 = codes[1]
                const reg2 = codes[2]
                const r1 = regs[reg1]
                const r2 = regs[reg2]
                memory.push(7)
                memory.push(r1)
                memory.push(r2)
            }

            else if (op === 'save_from_register2') {
                offset += 3
                const reg1 = codes[1]
                const reg2 = codes[2]
                const r1 = regs[reg1]
                const r2 = regs[reg2]
                memory.push(15)
                memory.push(r1)
                memory.push(r2)
            }

            else if (op === 'load_from_register') {
                offset += 3
                const reg1 = codes[1]
                const reg2 = codes[2]
                const r1 = regs[reg1]
                const r2 = regs[reg2]
                memory.push(13)
                memory.push(r1)
                memory.push(r2)
            }

            else if (op === 'load_from_register2') {
                offset += 3
                const reg1 = codes[1]
                const reg2 = codes[2]
                const r1 = regs[reg1]
                const r2 = regs[reg2]
                memory.push(14)
                memory.push(r1)
                memory.push(r2)
            }

            else if (op === 'jump_from_register') {
                offset += 2
                const reg = codes[1]
                const r = regs[reg]
                memory.push(16)
                memory.push(r)
            }

            else if (op === 'compare') {
                offset += 3
                const reg1 = codes[1]
                const reg2 = codes[2]
                const r1 = regs[reg1]
                const r2 = regs[reg2]
                memory.push(4)
                memory.push(r1)
                memory.push(r2)
            }

            else if (op === 'jump_if_less') {
                offset += 3
                const addr = this.process_address(codes[1])
                if (this.isNumber(addr)) {
                    const [lowAddress, highAddress] = this.get_high_low(addr)
                    memory.push(5)
                    memory.push(lowAddress)
                    memory.push(highAddress)
                } else {
                    memory.push(5)
                    memory.push(addr)
                }
            }

            else if (op === 'jump') {
                offset += 3
                const addr = this.process_address(codes[1])
                if (this.isNumber(addr)) {
                    const [lowAddress, highAddress] = this.get_high_low(addr)
                    memory.push(6)
                    memory.push(lowAddress)
                    memory.push(highAddress)
                } else {
                    memory.push(6)
                    memory.push(addr)
                }
            }

            else if (op === 'shift_right') {
                offset += 2
                const reg = codes[1]
                const r = regs[reg]
                memory.push(17)
                memory.push(r)
            }

            else if (op === 'and') {
                offset += 4
                const reg1 = codes[1]
                const reg2 = codes[2]
                const reg3 = codes[3]
                const r1 = regs[reg1]
                const r2 = regs[reg2]
                const r3 = regs[reg3]
                memory.push(19)
                memory.push(r1)
                memory.push(r2)
                memory.push(r3)
            }

            else if (op === '.memory') {
                const num = codes[1]
                const n = Number(num)
                const o = n - offset

                memory = [...memory, ...Array(o).fill(0)]
                offset += o
            }

            else if (op === 'halt') {
                offset += 1
                memory.push(255)
            }

            else if (op[0] === '@') {
                label_address[op.slice(1)] = offset
            }

        }

        for (let i = 0; i < memory.length; i++) {
            const c = memory[i]
            if (this.isString(c)) {
                const [lowAddress, highAddress] = this.get_high_low(label_address[c])
                memory[i] = lowAddress
                memory.splice(i + 1, 0, highAddress)
            }
            
        }

        return memory
    }

    _deleteTab(codes) {
        return codes.filter(c => c !== '')
    }

    get_high_low(num) {
        const low = num & 255
        const high = num >> 8

        return [low, high]
    }

    process_address(address) {
        const a = address.slice(1)
        const addr = Number(a)
        if (isNaN(addr)) {
            return a
        } else {
            return addr
        }
    }

    isNumber(v){
        return Object.prototype.toString.call(v) === '[object Number]'
    }

    isString(v) {
        return Object.prototype.toString.call(v) === '[object String]'
    }

}
export default MachineCode