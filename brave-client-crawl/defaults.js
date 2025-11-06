import { homedir } from 'node:os'

import { canExecPath, canReadDirAtPath } from './validate.js'

const userHomeDirPath = homedir()
const constants = {
  urls: [
    'https://www.peteresnyder.com'
  ]
}

const _getFirstExecutablePath = async paths => {
  for (const aPath of paths) {
    if (await canExecPath(aPath)) {
      return aPath
    }
  }
}

const _guessBinaryPathMacOS = async _ => {
  const binaryPaths = [
    '/Applications/Brave Browser Nightly.app/Contents/MacOS/Brave Browser Nightly',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
  ]
  return await _getFirstExecutablePath(binaryPaths)
}

const _guessBinaryPathLinux = async _ => {
  // Taken from https://source.chromium.org/chromium/chromium/src/+/main:chrome/test/chromedriver/chrome/chrome_finder.cc
  const binaryDirs = [
    '/usr/local/sbin',
    '/usr/local/bin',
    '/usr/sbin',
    '/usr/bin',
    '/sbin',
    '/bin'
  ]

  const binaryNames = [
    'brave-browser',
    'brave-browser-beta',
    'brave-browser-nightly'
  ]

  for (const aBinaryDir of binaryDirs) {
    for (const aBinaryName of binaryNames) {
      const possiblePath = `${aBinaryDir}/${aBinaryName}`
      if (await canExecPath(possiblePath)) {
        return possiblePath
      }
    }
  }
}

const guessBinaryPath = async _ => {
  switch (process.platform) {
    case 'darwin':
      return await _guessBinaryPathMacOS()
    case 'linux':
      return await _guessBinaryPathLinux()
    case 'win32':
      throw new Error('No guess for where things are stored on Windows')
  }
}

const _getFirstReadableDirPath = async dirPaths => {
  for (const aPossibleDirectoryPath of dirPaths) {
    if (await canReadDirAtPath(aPossibleDirectoryPath)) {
      return aPossibleDirectoryPath
    }
  }
}

const _guessUserDataDirMacOS = async _ => {
  const possibleProfilePaths = [
    `${userHomeDirPath}/Library/Application Support/BraveSoftware/Brave-Browser-Nightly`,
    `${userHomeDirPath}/Library/Application Support/BraveSoftware/Brave-Browser`
  ]
  return await _getFirstReadableDirPath(possibleProfilePaths)
}

const _guessUserDataDirLinux = async _ => {
  const possibleProfilePaths = [
    `${userHomeDirPath}/.config/brave-browser-nightly`,
    `${userHomeDirPath}/.config/brave-browser`
  ]
  return await _getFirstReadableDirPath(possibleProfilePaths)
}

// Adapted from https://chromium.googlesource.com/chromium/src/+/HEAD/docs/user_data_dir.md
const guessUserDataDir = async _ => {
  switch (process.platform) {
    case 'darwin':
      return await _guessUserDataDirMacOS()
    case 'linux':
      return await _guessUserDataDirLinux()
    case 'win32':
      throw new Error('No guess for where things are stored on Windows')
  }
}

export {
  constants,
  guessBinaryPath,
  guessUserDataDir
}
