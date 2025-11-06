import { readFile } from 'node:fs/promises'
import { request } from 'node:http'

const send = async (serverUrl, reportZipPath, logger) => {
  const zipFileContents = await readFile(reportZipPath)
  const zipFileSize = zipFileContents.size

  return new Promise((resolve, reject) => {
    const serverUrlParts = new URL(serverUrl)
    const requestOptions = {
      host: serverUrlParts.hostname,
      port: serverUrlParts.port,
      path: serverUrlParts.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/zip',
        'Content-Length': zipFileSize
      }
    }

    logger.info(`Sending file to ${serverUrl}`, reportZipPath)

    const requestStream = request(requestOptions, (responseStream) => {
      responseStream.on('end', _ => {
        resolve()
      })
    })

    requestStream.on('error', err => {
      reject(err)
    })

    requestStream.write(zipFileContents)
  })
}

export {
  send
}
