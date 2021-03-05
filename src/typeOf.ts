const typeOf = (value: any) =>
  Object.prototype.toString
    .call(value)
    .slice(8, -1)
    .toLowerCase()

export default typeOf
