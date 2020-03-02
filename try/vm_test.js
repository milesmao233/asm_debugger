import log from '../src/utils/utils';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class AxePU16 {
    constructor(memory, memoryWithLine, machineCodeEditor, codeEditor, showRegisterDOM) {
        this.memory = memory
        this.memoryWithLine = memoryWithLine
        this.machineCodeEditor = machineCodeEditor
        this.codeEditor = codeEditor
        this.showRegisterDOM = showRegisterDOM
        this.registers = {
            pa: 0,
            a1: 0,
            a2: 0,
            a3: 0,
            c1: 0,
            f1: 0,
        }
    }

    async run() {
        let pa, op

        while (true) {
            pa = this.registers['pa']
            op = this.memory[pa]
            // await this.addAndRemoveHighLight(pa)
            
            // set
            if (op === 0) {
                this.registers['pa'] += 3
                await this.addAndRemoveHighLight(pa)

                let reg = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)

                let value = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)
                this.set_register(reg, value)
            } 

            // set2
            else if (op === 8) {
                this.registers['pa'] += 4
                await this.addAndRemoveHighLight(pa)

                let reg = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)

                let low_value = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)

                let high_value = this.memory[pa + 3]
                await this.addAndRemoveHighLight(pa + 3)

                let value = this.calculate_from_low_high(low_value, high_value)
                this.set_register(reg, value)
            }
            // load
            else if (op === 1) {
                this.registers['pa'] += 4
                await this.addAndRemoveHighLight(pa)


                let address_low = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)

                let address_high = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)

                let reg = this.memory[pa + 3]
                await this.addAndRemoveHighLight(pa + 3)

                let address = this.calculate_from_low_high(address_low, address_high)
                let value = this.memory[address]
                this.set_register(reg, value)
            }

            // load2
            else if (op === 9) {
                this.registers['pa'] += 4
                await this.addAndRemoveHighLight(pa)
                let address_low = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                let address_high = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)
                let value_high = this.memory[address + 1]
                await this.addAndRemoveHighLight(pa + 3)

                let address = this.calculate_from_low_high(address_low, address_high)
                let value_low = this.memory[address]
                let value = this.calculate_from_low_high(value_low, value_high)

                let reg = this.memory[pa + 3]
                this.set_register(reg, value)
            }

            // add
            else if (op === 2) {
                this.registers['pa'] += 4
                await this.addAndRemoveHighLight(pa)
                let reg1 = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                let reg2 = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)
                let reg3 = this.memory[pa + 3]
                await this.addAndRemoveHighLight(pa + 3)

                let reg1_value = this.get_register(reg1)
                let reg2_value = this.get_register(reg2)

                let reg3_value = reg1_value + reg2_value
                let reg3_value_low = this.get_low_value(reg3_value)
                this.set_register(reg3, reg3_value_low)
            }

            // add2
            else if (op === 10) {
                this.registers['pa'] += 4
                await this.addAndRemoveHighLight(pa)
                let reg1 = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                let reg2 = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)
                let reg3 = this.memory[pa + 3]
                await this.addAndRemoveHighLight(pa + 3)

                let reg1_value = this.get_register(reg1)
                let reg2_value = this.get_register(reg2)

                let reg3_value = reg1_value + reg2_value
                if (reg3_value > 0xffff) {
                    reg3_value = 0
                }
                    
                this.set_register(reg3, reg3_value)
            }

            // save
            else if (op === 3) {
                this.registers['pa'] += 4
                await this.addAndRemoveHighLight(pa)
                let reg = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                let address_low = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)
                let address_high = this.memory[pa + 3]
                await this.addAndRemoveHighLight(pa + 3)

                let reg_value = this.get_register(reg)
                let reg_value_low = this.get_low_value(reg_value)
                let address = this.calculate_from_low_high(address_low, address_high)

                this.memory[address] = reg_value_low
            }

            // save2
            else if (op === 11) {
                this.registers['pa'] += 4
                await this.addAndRemoveHighLight(pa)
                let reg = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                let address_low = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)
                let address_high = this.memory[pa + 3]
                await this.addAndRemoveHighLight(pa + 3)

                let reg_value = this.get_register(reg)
                let reg_value_low = this.get_low_value(reg_value)
                let reg_value_high = this.get_high_value(reg_value)

                let address = this.calculate_from_low_high(address_low, address_high)

                this.memory[address] = reg_value_low
                this.memory[address + 1] = reg_value_high
            }

            // compare
            else if (op === 4) {
                this.registers['pa'] += 3
                await this.addAndRemoveHighLight(pa)
                let reg1 = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                let reg2 = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)

                let reg1_value = this.get_register(reg1)
                let reg2_value = this.get_register(reg2)
                if (reg1_value < reg2_value) {
                    this.set_register(64, 0)
                } else if (reg1_value > reg2_value) {
                    this.set_register(64, 2)
                } else {
                    this.set_register(64, 1)
                }
            }

            // jump_if_less
            else if (op === 5) {
                this.registers['pa'] += 3
                await this.addAndRemoveHighLight(pa)
                let address_low = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                let address_high = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)

                let address = this.calculate_from_low_high(address_low, address_high)
                let c1 = this.get_register(64)
                if (c1 == 0) {
                    this.registers['pa'] = address
                }
            }

            // jump
            else if (op === 6) {
                this.registers['pa'] += 3
                await this.addAndRemoveHighLight(pa)
                let address_low = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                let address_high = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)

                let address = this.calculate_from_low_high(address_low, address_high)
                this.registers['pa'] = address
            }

            // save_from_register
            else if (op === 7) {
                this.registers['pa'] += 3
                await this.addAndRemoveHighLight(pa)
                reg1 = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                reg2 = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)

                let reg1_value = this.get_register(reg1)
                let reg2_value = this.get_register(reg2)
                this.memory[reg2_value] = reg1_value
            }

            // save_from_register2
            else if (op === 15) {
                this.registers['pa'] += 3
                await this.addAndRemoveHighLight(pa)
                let reg1 = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                let reg2 = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)

                let reg1_value = this.get_register(reg1)
                let reg1_value_low = this.get_low_value(reg1_value)
                let reg1_value_high = this.get_high_value(reg1_value)
                let address_low = this.get_register(reg2)
                let address_high = address_low + 1
                this.memory[address_low] = reg1_value_low
                this.memory[address_high] = reg1_value_high
            }

            // subtract2
            else if (op === 12) {
                this.registers['pa'] += 4
                await this.addAndRemoveHighLight(pa)
                let reg1 = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                let reg2 = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)
                let reg3 = this.memory[pa + 3]
                await this.addAndRemoveHighLight(pa + 3)

                let reg1_value = this.get_register(reg1)
                let reg2_value = this.get_register(reg2)

                let reg3_value = reg1_value - reg2_value
                this.set_register(reg3, reg3_value)
            }

            // load_from_register
            else if (op === 13) {
                this.registers['pa'] += 3
                await this.addAndRemoveHighLight(pa)
                let reg1 = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                let reg2 = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)

                let address = this.get_register(reg1)
                let value = this.memory[address]
                this.set_register(reg2, value)
            }

            // load_from_register
            else if (op === 14) {
                this.registers['pa'] += 3
                await this.addAndRemoveHighLight(pa)
                let reg1 = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)
                let reg2 = this.memory[pa + 2]
                await this.addAndRemoveHighLight(pa + 2)

                let address = this.get_register(reg1)
                let address1 = address + 1
                let value_low = this.memory[address]
                let value_high = this.memory[address1]

                let value = this.calculate_from_low_high(value_low, value_high)
                this.set_register(reg2, value)
            }

            // jump_from_register
            else if (op === 16) {
                this.registers['pa'] += 2
                await this.addAndRemoveHighLight(pa)
                let reg = this.memory[pa + 1]
                await this.addAndRemoveHighLight(pa + 1)

                let reg_value = this.get_register(reg)
                this.registers['pa'] = reg_value
            }

            // shift_right
            else if (op === 17) {
                this.registers['pa'] += 2
                let reg = this.memory[pa + 1]

                let reg_value = this.get_register(reg)
                let new_value = reg_value >> 1
                this.set_register(reg, new_value)
            }

            // and
            else if (op === 19) {
                this.registers['pa'] += 4
                const reg1 = this.memory[pa + 1]
                const reg2 = this.memory[pa + 2]
                const reg3 = this.memory[pa + 3]
                const reg1_value = this.get_register(reg1)
                const reg2_value = this.get_register(reg2)

                const reg3_value = reg1_value & reg2_value
                this.set_register(reg3, reg3_value)
            }
            
            else if (op === 255) {
                await this.addAndRemoveHighLight(pa)
                break
            }

            else {
                break
            }
        }
    }

    async addAndRemoveHighLight(pa) {
        let asmNum = this.memoryWithLine[pa]
        this.machineCodeEditor.addLineClass(pa, 'background', 'highline-background')
        this.machineCodeEditor.scrollIntoView({line: pa}, 100)
        this.codeEditor.addLineClass(asmNum, 'background', 'highline-background')
        this.codeEditor.scrollIntoView({line: asmNum}, 100)
        await sleep(1000/60)
        this.machineCodeEditor.removeLineClass(pa, 'background', 'highline-background')
        this.codeEditor.removeLineClass(asmNum, 'background', 'highline-background')

    }

    set_register(reg, value) {
        if (reg == 0) {
            this.registers['pa'] = value
        }
        if (reg == 16) {
            this.registers['a1'] = value
        }
        if (reg == 32) {
            this.registers['a2'] = value
        }
        if (reg == 48) {
            this.registers['a3'] = value
        }
        if (reg == 64) {
            this.registers['c1'] = value
        }
        if (reg == 80) {
            this.registers['f1'] = value
        }
        const e = new Event("change_register")
        e.stack = this.memory.slice(0, 1024)
        e.registers = this.registers;
        this.showRegisterDOM.dispatchEvent(e);

    }

    get_register(reg) {
        let v
        if (reg == 0) {
            v = this.registers['pa']
        }
        if (reg == 16) {
            v = this.registers['a1']
        }
        if (reg == 32) {
            v = this.registers['a2']
        }
        if (reg == 48) {
            v = this.registers['a3'] 
        }
        if (reg == 64) {
            v = this.registers['c1']
        }
        if (reg == 80) {
            v = this.registers['f1']
        }
        return v
    }

    calculate_from_low_high(low, high) {
        let v = (high << 8) + low
        return v
    }

    get_high_value(value) {
        return value >> 8
    }

    get_low_value(value) {
        return value & 255
    }
    
}

export default AxePU16