import puppeteer from 'puppeteer-core'

const launchPuppeteer = async (binaryPath, profilePath, logger) => {
  // See https://pptr.dev/api/puppeteer.launchoptions
  const launchArgs = {
    enableExtensions: true,
    executablePath: binaryPath
  }
}

const crawlUrls = async (binaryPath, profilePath, urls, logger) => {

}

export {
  crawlUrls
}
