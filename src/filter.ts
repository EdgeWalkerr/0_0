export const filter = <T>(arr: T[], filterItem: T) => {
  let i = 0
  while (i < arr.length) {
    if (arr[i] === filterItem) {
      arr.splice(i, 1)
    } else {
      i++
    }
  }
  return arr
}
