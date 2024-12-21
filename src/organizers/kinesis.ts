import { CloudomiumLambda } from './_lambda'
import { ErrorHandler, Handler } from '../types/middleware'
import { KinesisEvent, KinesisStreamEventSourceMappingProps } from '../types/kinesis'
import { KinesisStreamBatchResponse } from 'aws-lambda'
import { LambdaContext } from '../types/lambda'
import { ResourceType } from '../types/aws'

/**
 * Lambda organizer with middleware support for Kinesis Stream events
 * @class KinesisLambda
 * @template CE - Kinesis Stream Event
 * @template CR - Kinesis Stream Batch Response
 * @template CC - Context type
 * @example new KinesisLambda<KinesisEvent, KinesisStreamBatchResponse>()
 */
export class KinesisLambda<CE = KinesisEvent, CR = KinesisStreamBatchResponse, CC = LambdaContext> extends CloudomiumLambda<CE, CC, CR> {
    queue(id: string, name: string) {
        return this.metadata(ResourceType.Kinesis.ID, id).metadata(ResourceType.Kinesis.STREAM, name)
    }

    eventSourceMapping(props: KinesisStreamEventSourceMappingProps) {
        return this.metadata(ResourceType.Kinesis.EVENT_SOURCE_MAPPING, props)
    }

    /**
     * Assigns the handler function
     * @param {Handler<CE, CC, CR>} handler - Handler to be executed
     * @param {ErrorHandler<CR>} [onError] - Error handler for the handler
     * @returns {Handler<CE, CC, CR>}
     */
    execute(handler: Handler<CE, CC, CR>, onError?: ErrorHandler<CR>): Handler<CE, CC, CR> {
        return async (event: CE, context: CC): Promise<CR> => {
            let response = { batchItemFailures: [] } as CR
            for (const { middleware, onError } of this.onBefore) {
                try {
                    const result = await middleware(event, context)
                    if (result) return result
                } catch (e) {
                    const err = e as Error
                    if (onError) return onError(err)

                    return response
                }
            }

            try {
                // @ts-ignore
                if (event.Records?.length) {
                    // @ts-ignore
                    event.Records = event.Records.map((record) => {
                        record.kinesis.data = JSON.parse(Buffer.from(record.kinesis.data as string, 'base64').toString('utf-8'))
                        return record
                    })
                }

                const result = await handler(event, context)
                if (result) response = result
            } catch (e) {
                const err = e as Error
                if (onError) return onError(err)

                // @ts-ignore
                response.batchItemFailures.push(...event.Records.map((record) => ({ itemIdentifier: record.eventID })))

                return response
            }

            for (const { middleware, onError } of this.onAfter) {
                try {
                    const result = await middleware(event, context, response)
                    if (result) return result
                } catch (e) {
                    const err = e as Error
                    if (onError) return onError(err)

                    return response
                }
            }

            return response
        }
    }
}
