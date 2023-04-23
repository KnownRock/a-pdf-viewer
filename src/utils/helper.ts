export function throttle<T extends (...args: any[]) => void> (fn: T, wait: number): T {
  let time = Date.now()
  return function (...args: any[]) {
    if ((time + wait - Date.now()) < 0) {
      fn(...args)
      time = Date.now()
    }
  } as T
}
