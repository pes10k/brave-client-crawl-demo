export const make = level => {
  const noopLogger = _ => {}

  switch (level) {
    case 'none':
      return {
        info: noopLogger,
        verbose: noopLogger
      }
    case 'info':
      return {
        info: console.log,
        verbose: noopLogger
      }
    case 'verbose':
      return {
        info: console.log,
        verbose: console.log
      }
    default:
      throw new Error(`Unrecognized logger level: ${level}`)
  }
}
