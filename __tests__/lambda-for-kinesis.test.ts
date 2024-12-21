import assert from 'node:assert/strict'
import { callbackWaitsForEmptyEventLoopMiddleware } from '../src'
import { KinesisLambda } from '../src'
import { test } from 'node:test'

test('kinesis lambda handler with invalid body', async () => {
    const handler = new KinesisLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
        return { batchItemFailures: [] }
    })
    const result = await handler({ Records: [{ eventID: '1', kinesis: { partitionKey: 'part', data: 'invalid body' } }] } as any, {} as any)
    assert.equal(result.batchItemFailures.length, 1)
    assert.equal(result.batchItemFailures[0].itemIdentifier, '1')
})

test('kinesis lambda handler with empty records', async () => {
    const handler = new KinesisLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
        return { batchItemFailures: [] }
    })
    await handler({ Records: [] } as any, {} as any)
})

test('kinesis lambda handler with records', async () => {
    const handler = new KinesisLambda().before(callbackWaitsForEmptyEventLoopMiddleware({ wait: true })).execute(async (event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, true)
        assert.equal(event.kinesis.partitionKey, 'part')
        assert.equal(event.kinesis.data.abc, 123)
        return { batchItemFailures: [] }
    })
    await handler({ Records: [{ kinesis: { partitionKey: 'part', data: Buffer.from('{ "abc" : 123 }').toString('base64') } }] } as any, {} as any)
})