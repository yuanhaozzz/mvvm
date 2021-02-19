

function Mvvm(options) {
    this.$options = options
    this.$data = options.data
    new Observer(this.$data)
    new Compiler(this.$options.el, this.$options)
    this.proxy()
}

Mvvm.prototype.proxy = function () {
    let data = this.$data
    for (let key in data) {
        Object.defineProperty(this.$options, key, {
            enumerable: true,
            configurable: false,
            get: function () {
                return data[key]
            },
            set: function (newVal) {
                if (data[key] === newVal) {
                    return
                }
                data[key] = newVal
            }
        })
    }
    // this.first = 12
}