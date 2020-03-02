class CodeEditor {
    constructor() {
        this.editorCode = CodeMirror.fromTextArea(document.getElementById("code"), {
            lineNumbers: true,
            gutters: ["CodeMirror-linenumbers", "breakpoints"],
        })
    
        this.editorMachineCode = CodeMirror.fromTextArea(document.getElementById("machine-code"), {
            lineNumbers: true,
        })

        this.editorCode.setSize(500, 600)
        this.editorMachineCode.setSize(200, 600)

        this.machineCodes = null
        this.machineCodesWithLine = null
    }


    bindEvents() {
        let button = document.querySelector('#id-button')
        button.addEventListener('click', (event) => {
            // log('machineCodes', this.machineCodes)
            // this.runMachineCodes()
            this.calculate(showRegisterDOM)
        })

        let showRegisterDOM = document.querySelector('#id-registers-div')
        showRegisterDOM.addEventListener('change_register', (event) => {
            let target = event.target
            let registers = event.registers
            let stack = event.stack
            // console.log('event.registers', event.registers)
            let {pa, a1, a2, a3, c1, f1} = registers
            let children = target.querySelector('tbody').querySelectorAll('td')
            children = Array.prototype.slice.call(children)
            let r = {
                'pa': pa,
                'a1': a1,
                'a2': a2,
                'a3': a3,
                'c1': c1,
                'f1': f1,
            }
            for(let child of children) {
                child.innerHTML = r[child.dataset.register]
            }

            let f1DOM = document.querySelector('#id-stack-body')
            let f1Children = f1DOM.children
            f1Children = Array.prototype.slice.call(f1Children)
            f1Children = this.reverseDOM(f1Children)
            
            for(let i = 0; i < f1Children.length; i++) {
                f1Children[i].innerText = stack[i]
            }
        })

        this.editorCode.on("gutterClick", function(cm, n) {
            var info = cm.lineInfo(n);
            cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : this.makeMarker());
        })

        this.editorCode.on('blur', async (editor) =>  {
            const text = editor.doc.getValue()
            let req = {
                content: text
            }
            
            const response = await AsmModel.convert(req)
            let codes = response["codes"]
            this.machineCodes = codes
            this.machineCodesWithLine = response["lines"]

            // log('lines', this.machineCodesWithLine)
    
            let codesArr = codes.map(code => {
                let arr = []
                let c = this.dec2bin(code)
                if (c.length < 8) {
                    let l = 8 - c.length
                    c = this.addZero(l, c)
                }
                arr.push(c)
                arr.push(code)
                let string = arr.join('    ')
                return string
            })
            let codesShow = codesArr.join('\n')
            this.editorMachineCode.setValue(codesShow)
        })
    }

    async calculate(showRegisterDOM) {
        let cpu = new AxePU16(this.machineCodes, this.machineCodesWithLine, this.editorMachineCode, this.editorCode, showRegisterDOM)
        await cpu.run()
        log(cpu.registers['a1'])
    }

    runMachineCodes() {
        for (let i = 1; i <= this.machineCodes.length; i++) {
            setTimeout(() => {
                this.editorMachineCode.addLineClass(i-1, 'background', 'highline-background')
            }, i * 500)
            setTimeout(() => {
                this.editorMachineCode.removeLineClass(i-1, 'background', 'highline-background')
            }, i * 500 + 250)
        }
    }

    makeMarker() {
        var marker = document.createElement("div");
        marker.style.color = "#822";
        marker.innerHTML = "●";
        return marker;
    }

    addZero(n, string) {
        let z = []
        for (let i = 0; i < n; i++) {
            z.push('0')
        }
        z.push(string)
        const result  = z.join('')
        return result
    }

    dec2bin(dec) {
        return (dec >>> 0).toString(2);
    }

    reverseDOM(arr) {
        let result = []
        for (let a of arr) {
            result.unshift(a)
        }
        return result
    }
}