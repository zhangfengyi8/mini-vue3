export const extend = Object.assign

export function isObject(value) {
    return value !== null && typeof value === 'object'
}

export function hasChanged(value, oldValue) {
    return Object.is(value, oldValue)
}

export const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)