import { makeWorkspace } from './disk.js'

import puppeteer from 'puppeteer-core'

const launchPuppeteer = async (binaryPath, userDataDirPath, profile, logger) => {
  const isVerboseLogging = logger.level === 'verbose'
  const chromeArgs = [
    `--profile-directory=${profile}`
  ]
  if (isVerboseLogging) {
    chromeArgs.push('--enable-logging=stderr')
    chromeArgs.push('--vmodule=page_graph*=2')
  }

  // See https://pptr.dev/api/puppeteer.launchoptions
  const launchArgs = {
    headless: false,
    userDataDir: userDataDirPath,
    enableExtensions: true,
    executablePath: binaryPath,
    dumpio: isVerboseLogging,
    args: chromeArgs,
    defaultViewport: null
  }

  logger.info('Launching puppeteer with the following launch options:')
  logger.info(launchArgs)
  return await puppeteer.launch(launchArgs)
}

const crawlUrl = (browser, url, logger) => {
  const results = {
    response: null,
    load: null,
    domcontentloaded: null
  }
  const totalResults = Object.keys(results).length
  let numResults = 0

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const page = await browser.newPage()

    try {
      const addResultAndResolveIfComplete = async (resultName, resultText) => {
        logger.info(`load event "${resultName}", size ${resultText.length}`)
        logger.verbose(resultText)

        numResults += 1
        results[resultName] = resultText
        if (totalResults === numResults) {
          await page.close()
          resolve(results)
        }
      }

      page.once('load', async _ => {
        const pageContent = await page.content()
        await addResultAndResolveIfComplete('load', pageContent)
      })
      page.once('domcontentloaded', async _ => {
        const pageContent = await page.content()
        await addResultAndResolveIfComplete('domcontentloaded', pageContent)
      })

      const request = await page.goto(url)
      await addResultAndResolveIfComplete('response', await request.text())
    } catch (error) {
      logger.error(error)
      try {
        await page.close()
      } catch { }
      reject(error)
    }
  })
}

const run = async (binaryPath, userDataDirPath, profileName, urls, logger) => {
  const workspace = await makeWorkspace()
  logger.info('Created temp workspace at ', workspace.path)

  const browser = await launchPuppeteer(binaryPath, userDataDirPath, profileName, logger)
  for (const aUrl of urls) {
    logger.info(`About to crawl ${aUrl}`)
    const resultsForUrl = await crawlUrl(browser, aUrl, logger)
    await workspace.addResultsForUrl(aUrl, resultsForUrl)
  }

  logger.info('Crawling complete')
  await browser.close()

  return workspace
}

export {
  run
}
