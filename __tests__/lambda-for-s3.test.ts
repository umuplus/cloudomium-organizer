import assert from 'node:assert/strict'
import { callbackWaitsForEmptyEventLoopMiddleware } from '../src'
import { S3Lambda } from '../src'
import { test } from 'node:test'

test('s3 lambda handler with invalid body', async () => {
    const handler = new S3Lambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
    })
    await handler({ Records: [{ messageId: 'abc', body: 'invalid body' }] as any }, {} as any)
})

test('s3 lambda handler with empty records', async () => {
    const handler = new S3Lambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
    })
    await handler({ Records: [] }, {} as any)
})

test('s3 lambda handler with records', async () => {
    const handler = new S3Lambda().before(callbackWaitsForEmptyEventLoopMiddleware({ wait: true })).execute(async (event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, true)
        assert.equal(event.Records[0].s3.bucket.name, 'test')
        assert.equal(event.Records[0].s3.object.key, 'test')
    })
    await handler({ Records: [{ s3: { bucket: { name: 'test' }, object: { key: 'test' } } }] as any }, {} as any)
})

test('s3 lambda with metadata', async () => {
    const organizer = new S3Lambda().metadata('test', { a: 1 })
    const handler = organizer.execute(async (event: any, _context: any) => {
        assert.equal(event.Records[0].s3.bucket.name, 'test')
        assert.equal(event.Records[0].s3.object.key, 'test')
    })
    await handler({ Records: [{ s3: { bucket: { name: 'test' }, object: { key: 'test' } } }] as any }, {} as any)
    assert.equal(organizer.metadata('test').a, 1)
})