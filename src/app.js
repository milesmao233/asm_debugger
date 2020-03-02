// import js 文件的时候通常会省略文件后缀名
// import 其他文件不会省略
import log from './utils/utils'
import './app.css'
import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/lib/codemirror.css'
// import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/selection/active-line.js'
// import AsmModel from './model/asm';
import AxePU16 from './model/virtual_machine';
import { getMachineCode } from './controller/asm_controller'
import {fps} from './config/config'
import calPostion from './model/cal-asm/cal-position'


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Editor {
    constructor(editor, cpu) {
        this.editor = editor
        this.cpu = cpu
    }
}

class MachineCodeEditor extends Editor {
    constructor(editor, cpu, codeEditor) {
        super(editor, cpu)
        this.codeEditor = codeEditor
        this.machineCodes = null
        this.init()
    }

    init() {
        this.editor.setSize(200, 600)
        this.codeEditor.attach(this)
        this.cpu.attach(this)
    }

    update(codes) {
        this.machineCodes = codes
        let codesShow = this.transformCodes(this.machineCodes)
        this.editor.setValue(codesShow)
    }

    async updateHighLight(line) {
        this.editor.addLineClass(line, 'background', 'highline-background')
        this.editor.scrollIntoView({line: line}, 100)
        await sleep(fps)
        this.editor.removeLineClass(line, 'background', 'highline-background')
    }

    transformCodes(codes) {
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
        return codesShow
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
}

class CodeEditor extends Editor {
    constructor(editor, cpu) {
        super(editor, cpu)
        this.observers = []
        this.caledPositions = null
        this.breakLine = []
        this.gutterClickCallback = this.gutterClickCallback.bind(this)
        this.init()
    }

    init() {
        this.editor.on("gutterClick", this.gutterClickCallback)
        this.editor.on('blur', (editor) => this.blurCallback(editor))
        this.editor.setSize(500, 600)
        this.cpu.attach(this)
    }

    async updateHighLight(paLine) {
        const line = this.caledPositions[paLine]
        this.editor.addLineClass(line, 'background', 'highline-background')
        this.editor.scrollIntoView({line: line}, 100)
        
        // this.cpu.paused === false || this.cpu.runNextBool === true
        if (!this.cpu.paused || this.cpu.runNextBool) {
            await sleep(fps)
            this.editor.removeLineClass(line, 'background', 'highline-background')
        }
    }

    gutterClickCallback(cm, n) {
        const makeMaker = () => {
            var marker = document.createElement("div");
            marker.style.color = "#822";
            marker.innerHTML = "●";
            return marker;
        }
        if (this.breakLine.includes(n)) {
            const index = this.breakLine.indexOf(n)
            this.breakLine.splice(index, 1)
        } else {
            this.breakLine.push(n)
        }
        this.cpu.breakpoints = this.breakLine

        var info = cm.lineInfo(n);
        cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMaker());
    }

    blurCallback(editor) {
        const content = editor.doc.getValue()
        this.caledPositions = calPostion(content)
        const machineCodes = getMachineCode(content)
        this.notifyAllObservers(machineCodes)

        this.cpu.caledPositions = this.caledPositions
    }

    attach(observer) {
        this.observers.push(observer)
    }

    notifyAllObservers(codes) {
        this.observers.forEach(observer => {
            observer.update(codes)
        })
    }
}

class Page {
    constructor(codeEditor, machineCodeEditor, cpu) {
        this.codeEditor = codeEditor
        this.machineCodeEditor = machineCodeEditor
        this.cpu = cpu

        this.codeEditor.attach(this)
        this.startCallback = this.startCallback.bind(this)
        this.continueCallback = this.continueCallback.bind(this)
        this.nextCallback = this.nextCallback.bind(this)
        this.registerStackCallback = this.registerStackCallback.bind(this)
        this.eventInit()
        this.pageInit()
    }

    eventInit() {
        const startButton = document.querySelector('#id-button')
        startButton.addEventListener('click', this.startCallback)

        const continueButton = document.querySelector('#id-button-continue')
        continueButton.addEventListener('click', this.continueCallback)

        const nextButton = document.querySelector('#id-button-next')
        nextButton.addEventListener('click', this.nextCallback)

        const registerStackDOM = document.querySelector('.register_stack')
        this.cpu.registerStackDOM = registerStackDOM
        registerStackDOM.addEventListener('change_register', this.registerStackCallback)
    }

    continueCallback() {
        this.cpu.continue()
        this.cpu.run()
    }

    nextCallback() {
        this.cpu.runNext()
        this.cpu.run()
    }

    pageInit() {
        const f1tbody = document.querySelector('#id-stack-body')

        for (let i = 0; i < 1024; i++) {
            let inner
            if (i == 0) {
                inner = `<tr>
                <td>${i}</td>
                <td>0</td>
                <td>f1</td>
                </tr>`
            } else {
                inner = `<tr>
                <td>${i}</td>
                <td>0</td>
                </tr>`
            }

            f1tbody.insertAdjacentHTML('afterbegin', inner)
        }

        const f1DIV = document.querySelector('#id-stack-div')
        f1DIV.scrollTop = f1DIV.scrollHeight - f1DIV.clientHeight
    }

    update(codes) {
        this.cpu.memory = codes
    }

    async startCallback() {
        if (!this.cpu.memory) {
            log('没有机器码运行')
        } else {
            await this.cpu.run()
            log(this.cpu.registers['a1'])
        }
    }

    registerStackCallback() {
        const target = event.target
        const registers = event.registers
        const stack = event.stack

        this.registerDOMChange(target, registers)
        this.stackDOMChange(target, stack, registers)
    }

    registerDOMChange(target, registers) {
        const {pa, a1, a2, a3, c1, f1} = registers
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
    }

    stackDOMChange(target, stack, registers) {
        const f1tbody = target.querySelector('#id-stack-body')
        const stackLen = stack.length
        const f1Val = registers.f1

        const newtbody = document.createElement('tbody')
        newtbody.setAttribute('id', 'id-stack-body')
        for (let i = 0; i < stackLen; i++) {
            let inner
            if (f1Val === i) {
                inner = `<tr>
                <td>${i}</td>
                <td>${stack[i]}</td>
                <td>f1</td>
                </tr>`
            } else {
                inner = `<tr>
                <td>${i}</td>
                <td>${stack[i]}</td>
                </tr>`
            }


            newtbody.insertAdjacentHTML('afterbegin', inner)
        }

        f1tbody.parentNode.replaceChild(newtbody, f1tbody)
    }

    reverseDOM(arr) {
        let result = []
        for (let a of arr) {
            result.unshift(a)
        }
        return result
    }
}


const __main = () => {
    const codeEditor = CodeMirror.fromTextArea(document.getElementById("code"), {
        lineNumbers: true,
        gutters: ["CodeMirror-linenumbers", "breakpoints"],
    })

    const machineCodeEditor = CodeMirror.fromTextArea(document.getElementById("machine-code"), {
        lineNumbers: true,
    })

    const cpu = new AxePU16()
    const ce = new CodeEditor(codeEditor, cpu)
    const me = new MachineCodeEditor(machineCodeEditor, cpu, ce)
    const page = new Page(ce, me, cpu)

}

__main()