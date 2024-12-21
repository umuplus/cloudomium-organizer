import { S3BucketEvent } from '../types/s3'
import { unzipSync } from 'zlib'

export interface S3FetchMiddlewareConfig {
    s3: { client: any; command: any }
    base64?: boolean
    compressed?: boolean
    json?: boolean
}

async function fetchFromS3(s3: { client: any; command: any }, bucket: string, key: string) {
    try {
        const params = { Bucket: bucket, Key: key }
        const data = await s3.client.send(new s3.command(params))
        return data.Body
    } catch (e) {
        return e
    }
}

/**
 * Middleware to fetch the object from S3.
 * @param [config] Configuration object for the middleware.
 * @param [config.base64] A boolean to indicate if the body is base64 encoded.
 * @param [config.compressed] A boolean to indicate if the body is compressed.
 * @param [config.json] A boolean to indicate if the body is JSON.
 * @returns A middleware function that fetches the object from S3.
 */
export default function (config: S3FetchMiddlewareConfig) {
    return async (event: S3BucketEvent, _context: any): Promise<void> => {
        const { s3, base64, compressed, json } = config
        const results = await Promise.all(event.Records.map((record) => fetchFromS3(s3, record.s3.bucket.name, record.s3.object.key)))
        for (let index = 0; index < event.Records.length; index++) {
            let body = results[index]
            if (body instanceof Error) event.Records[index].error = body
            else if (body) {
                if (base64) body = Buffer.from(body, 'base64')
                if (compressed) body = unzipSync(body)
                if (json) body = JSON.parse(body.toString())
                event.Records[index].s3.object.body = body
            }
        }
    }
}
