function Compiler(el, options) {
    this.$el = this.isElementNode(el) ? el : document.querySelector(el)
    this.$options = options
    this.$vm = options.data
    this.$methods = options.methods
    this.$fragment = this.nodeFragment()
    this.init()
    this.$el.appendChild(this.$fragment)
}

Compiler.prototype.init = function () {
    this.compiler()
}

Compiler.prototype.compiler = function () {
    let childNodes = this.$fragment.childNodes;

    [].slice.call(childNodes).forEach(node => {
        let reg = /\{\{(.*)\}\}/
        // 元素节点
        if (this.isElementNode(node)) {
            this.compilerElement(node)
        } else if (this.isTextNode(node) && reg.test(node.textContent)) {
            // 表达式{{}}
            this.compilerText(node, RegExp.$1.trim())
        }
    })
}

Compiler.prototype.compilerText = function (node, value) {
    compilerUtil.text(node, this.$vm, value, 'text')
}

Compiler.prototype.compilerElement = function (node) {
    let attr = node.attributes;
    [].slice.call(attr).forEach(attr => {
        let name = attr.name
        // 是否包含指令
        if (this.isDirective(name)) {
            let value = attr.value,
                dir = name.substring(2);
            if (this.isEventHandler(name)) {
                compilerUtil.eventHandler(node, value, name, this.$methods, this.$options)
            } else {
                compilerUtil[dir] && compilerUtil[dir](node, this.$vm, value)
                node.removeAttribute(name)
            }
        }
    })
    let reg = /\{\{(.*)\}\}/
    if (reg.test(node.textContent)) {
        this.compilerText(node, RegExp.$1.trim())
    }

}

Compiler.prototype.nodeFragment = function () {
    let fragment = document.createDocumentFragment(), child;
    while (child = this.$el.firstChild) {
        fragment.appendChild(child)
    }
    return fragment
}

Compiler.prototype.isTextNode = function (node) {
    return node.nodeType === 3
}

Compiler.prototype.isElementNode = function (node) {
    return node.nodeType === 1
}

Compiler.prototype.isDirective = function (str) {
    return str.includes('v-')
}

Compiler.prototype.isEventHandler = function (str) {
    return str.includes('on')
}

let compilerUtil = {
    text: function (node, vm, value) {
        this.update(node, vm, value, 'text')
    },
    html: function (node, vm, value) {
        this.update(node, vm, value, 'html')
    },
    bind: function () {

    },
    eventHandler: function (node, value, name, $methods, $options) {
        let method = $methods[value]
        if (method) {
            let event = name.split(':')[1]
            node.addEventListener(event, method.bind($options), false)
        }
    },
    model: function (node, vm, value) {
        this.update(node, vm, value, 'model')
        node.addEventListener('input', (e) => {
            let target = e.target,
                val = target.value;
            console.log(val)
            vm[value] = val;
        })

    },
    update: function (node, vm, value, type) {
        // 更新DOM
        let updateFn = update[type]
        updateFn && updateFn(node, vm, value)
        // 放入订阅者
        new Watch(vm, value, () => {
            updateFn(node, vm, value)
        })
    }
}

let update = {
    text: function (node, vm, value) {
        node.textContent = typeof vm[value] !== 'undefined' ? vm[value] : ''
    },
    html: function (node, vm, value) {
        node.innerHTML = typeof vm[value] !== 'undefined' ? vm[value] : ''
    },
    model: function (node, vm, value) {
        node.value = typeof vm[value] !== 'undefined' ? vm[value] : ''
    }
}