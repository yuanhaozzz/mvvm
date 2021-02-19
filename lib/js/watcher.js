
function Watch(vm, key, callback) {
    this.$vm = vm
    this.$key = key
    this.$callback = callback
    this.value = this.get()
}

Watch.prototype.get = function () {
    Dep.target = this
    let value = this.$vm[this.$key]
    Dep.target = null
    return value
}

Watch.prototype.update = function () {
    this.run()
}

Watch.prototype.run = function () {
    let newValue = this.get()
    if (newValue === this.value) {
        return
    }
    this.value = newValue
    this.$callback(this.value)
}
