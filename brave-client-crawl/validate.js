import { access, constants, stat } from 'node:fs/promises'
import { join } from 'node:path'

export const canExecPath = async aPath => {
  try {
    await access(aPath, constants.X_OK)
    return true
  } catch {
    return false
  }
}

export const canReadDirAtPath = async aPath => {
  const dirStat = await stat(aPath)
  if (dirStat.isDirectory() === false) {
    return false
  }

  try {
    await access(aPath, constants.R_OK)
    return true
  } catch {
    return false
  }
}

export const checkWorkArgs = async workArgs => {
  const { binaryPath, profile, userDataDir } = workArgs

  if (await canExecPath(binaryPath) === false) {
    throw new Error('Could not find a brave binary to crawl with.')
  }

  const possibleProfilePath = join(userDataDir, profile)
  if (await canReadDirAtPath(possibleProfilePath) === false) {
    throw new Error(`Could not find a profile directory named "${profile}" in the user data dir at "${userDataDir}".`)
  }

  return true
}
