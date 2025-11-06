#!/usr/bin/env node

import { ArgumentParser, FileType } from 'argparse'

import { crawlUrls } from './brave-client-crawl/crawl.js'
import * as defaults from './brave-client-crawl/defaults.js'
import { make as makeLogger } from './brave-client-crawl/logger.js'
import { checkWorkArgs } from './brave-client-crawl/validate.js'

const parser = new ArgumentParser({
  description: 'Crawl URLs and submit them to Pete Snyder <pes@brave.com> for Brave Together'
})
parser.add_argument('-b', '--binary', {
  help: 'Path to Brave Browser binary. If not provided, will try to guess it.',
  type: FileType('r')
})
// https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/user_data_dir.md
parser.add_argument('-d', '--user-data-dir', {
  help: 'Path to Brave user data directory to crawl with. If not provided, ' +
        'will try to guess the location of your user data directory.',
  type: FileType('r')
})
parser.add_argument('-p', '--profile', {
  help: 'The profile to crawl with. Defaults to "Default".',
  default: 'Default'
})
parser.add_argument('-u', '--urls', {
  help: 'The URLs to crawl as part of this measurement.',
  nargs: '?',
  default: defaults.constants.urls
})
parser.add_argument('-l', '--logging-level', {
  help: 'How much information to print to STDOUT about work progress.',
  choices: ['none', 'info', 'verbose'],
  default: 'info'
})
parser.add_argument('--dry-run', {
  help: 'If passed, describe the work that would be done, but do not ' +
        'actually crawl or report anything.',
  action: 'store_true',
  default: false
})

const args = parser.parse_args()

const logger = makeLogger(args.logging_level)
const workDesc = {
  urls: args.urls,
  binaryPath: args.binary ?? await defaults.guessBinaryPath(),
  userDataDir: args.user_data_dir ?? await defaults.guessUserDataDir(),
  profile: args.profile
}

if (checkWorkArgs(workDesc)) {
  logger.info(workDesc)
}
