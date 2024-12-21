import s3FetchMiddleware from '../src/middlewares/s3-fetch'

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { gzipSync } from 'node:zlib'
import { S3BucketEvent } from '../src/types/s3'

class S3Command {
    constructor(protected params: Record<string, any>) {
        if (params.Key === 'error') throw new Error('Error')
    }
}

function setupS3(body: any) {
    return {
        client: {
            send: async (_command: S3Command) => {
                return { Body: body }
            },
        },
        command: S3Command,
    }
}

test('s3 fetch middleware simple', async () => {
    const middleware = s3FetchMiddleware({ s3: setupS3(JSON.stringify({ val: 'test' })), json: true })
    const request: Record<string, any> = {
        Records: [
            {
                s3: {
                    bucket: { name: 'test' },
                    object: { key: 'test' },
                },
            },
        ],
    }
    await middleware(request as S3BucketEvent, null)
    assert.equal(request.Records[0].s3.object.body.val, 'test')
})

test('s3 fetch middleware base64 only', async () => {
    const body = Buffer.from(JSON.stringify({ val: 'test' })).toString('base64')
    const middleware = s3FetchMiddleware({ s3: setupS3(body), base64: true, json: true })
    const request: Record<string, any> = {
        Records: [
            {
                s3: {
                    bucket: { name: 'test' },
                    object: { key: 'test' },
                },
            },
        ],
    }
    await middleware(request as S3BucketEvent, null)
    assert.equal(request.Records[0].s3.object.body.val, 'test')
})

test('s3 fetch middleware with compressed', async () => {
    const payload = JSON.stringify({ val: 'test' })
    const compressedPayload = gzipSync(payload).toString('base64')
    const middleware = s3FetchMiddleware({ s3: setupS3(compressedPayload), compressed: true, base64: true, json: true })
    const request: Record<string, any> = {
        Records: [
            {
                s3: {
                    bucket: { name: 'test' },
                    object: { key: 'test' },
                },
            },
        ],
    }
    await middleware(request as S3BucketEvent, null)
    assert.equal(request.Records[0].s3.object.body.val, 'test')
})

test('s3 fetch middleware base64 error', async () => {
    const body = Buffer.from('xyz').toString('base64')
    const middleware = s3FetchMiddleware({ s3: setupS3(body), base64: true })
    const request: Record<string, any> = {
        Records: [
            {
                s3: {
                    bucket: { name: 'test' },
                    object: { key: 'error' },
                },
            },
        ],
    }
    await middleware(request as S3BucketEvent, null)
    assert.ok(request.Records[0].error instanceof Error)
})
