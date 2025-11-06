import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { ZipArchive } from 'archiver'

const _makeWorkspaceDir = async _ => {
  return await mkdtemp(join(tmpdir(), 'brave-client-crawl-'))
}

const _writeResults = async (url, workDescToResult, workspacePath) => {
  const dirForUrl = (new URL(url)).hostname
  const fullPathForUrl = join(workspacePath, dirForUrl)
  await mkdir(fullPathForUrl)
  for (const [workDesc, workResult] of Object.entries(workDescToResult)) {
    const workDescFileName = `${workDesc}.html`
    const workDescFilePath = join(fullPathForUrl, workDescFileName)
    await writeFile(workDescFilePath, workResult)
  }
}

const _workspaceAsZip = (workspacePath) => {
  return new Promise((resolve, reject) => {
    const tempZipPath = join(tmpdir(), 'brave-client-crawl.zip')
    const outputStream = createWriteStream(tempZipPath)

    const archive = new ZipArchive({
      zlib: { level: 9 }
    })

    archive.on('error', (err) => {
      reject(err)
    })

    outputStream.on('close', _ => {
      resolve(tempZipPath)
    })

    archive.pipe(outputStream)
    archive.directory(workspacePath, 'brave-client-crawl')
    archive.finalize()
  })
}

const makeWorkspace = async () => {
  const dirPath = await _makeWorkspaceDir()
  return {
    path: dirPath,
    asZip: async () => {
      return await _workspaceAsZip(dirPath)
    },
    delete: async () => {
      return await rm(dirPath, { recursive: true })
    },
    addResultsForUrl: async (url, workDescToResultMap) => {
      return await _writeResults(url, workDescToResultMap, dirPath)
    }
  }
}

export {
  makeWorkspace
}
