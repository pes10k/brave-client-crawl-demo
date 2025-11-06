export const make = level => {
  const noopLogger = _ => {}
  const logger = (levelName, ...msg) => {
    console.log(new Date().toString(), `${levelName}: `, ...msg)
  }

  const loggerObject = {
    level,
    error: logger.bind(undefined, 'error', '[!ERROR!]'),
    info: noopLogger,
    verbose: noopLogger
  }

  switch (level) {
    case 'info':
      loggerObject.info = logger.bind(undefined, 'info')
      break
    case 'verbose':
      loggerObject.info = logger.bind(undefined, 'info')
      loggerObject.verbose = logger.bind(undefined, 'verbose')
      break
    default:
      throw new Error(`Unrecognized logger level: ${level}`)
  }

  return loggerObject
}
