function Observer(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('param is not object')
    }

    for (let key in data) {
        this.defineReactive(data, key, data[key])
    }

}

Observer.prototype.defineReactive = function (data, key, value) {
    let dep = new Dep()
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: false,
        get: function () {
            Dep.target && dep.add(Dep.target)
            return value
        },
        set: function (newVal) {
            if (newVal === value) {
                return
            }
            value = newVal
            dep.notify()
        }
    })
}

function Dep() {
    this.subs = []
}

Dep.prototype.add = function (item) {
    this.subs.push(item)
}

Dep.prototype.notify = function () {
    this.subs.forEach(item => item.update())
}






