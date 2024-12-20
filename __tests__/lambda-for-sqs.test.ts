import assert from 'node:assert/strict'
import { callbackWaitsForEmptyEventLoopMiddleware } from '../src'
import { SqsLambda } from '../src'
import { test } from 'node:test'
import { gzipSync } from 'zlib'

test('sqs lambda handler with invalid body', async () => {
    const handler = new SqsLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
        return { batchItemFailures: [] }
    })
    const response: any = await handler({ Records: [{ messageId: 'abc', body: 'invalid body' }] as any }, {} as any)
    assert.equal(response.batchItemFailures.length, 1)
    assert.equal(response.batchItemFailures[0].itemIdentifier, 'abc')
})

test('sqs lambda handler with empty records', async () => {
    const handler = new SqsLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
        return { batchItemFailures: [] }
    })
    const response: any = await handler({ Records: [] }, {} as any)
    assert.equal(response.batchItemFailures.length, 0)
})

test('sqs lambda handler with records', async () => {
    const handler = new SqsLambda().before(callbackWaitsForEmptyEventLoopMiddleware({ wait: true })).execute(async (event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, true)
        assert.equal(event.Records[0].messageId, 'abc')
        assert.equal(event.Records[0].body.abc, 123)
        return { batchItemFailures: [] }
    })
    const response: any = await handler({ Records: [{ messageId: 'abc', body: gzipSync('{ "abc" : 123 }').toString('base64') }] as any }, {} as any)
    assert.equal(response.batchItemFailures.length, 0)
})

test.skip('sqs lambda with metadata', async () => {
    const organizer = new SqsLambda().metadata('test', { a: 1 })
    const handler = organizer.execute(async (event: any, _context: any) => {
        assert.equal(event.Records[0].messageId, 'abc')
        assert.equal(event.Records[0].body.abc, 123)
        return { batchItemFailures: [] }
    })
    const response: any = await handler({ Records: [{ messageId: 'abc', body: gzipSync('{ "abc" : 123 }').toString('base64') }] }, {})
    assert.equal(organizer.metadata('test').a, 1)
    assert.equal(response.batchItemFailures.length, 0)
})