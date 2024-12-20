import { CloudomiumLambda } from './_lambda'
import { ErrorHandler, Handler } from '../types/middleware'
import { gunzipSync } from 'zlib'
import { LambdaContext } from '../types/lambda'
import { ResourceType } from '../types/aws'
import { SQSBatchResponse } from 'aws-lambda'
import { SqsEvent, SqsEventSourceMappingProps, SqsRecord } from '../types/sqs'

/**
 * Lambda organizer with middleware support for SQS events
 * @class HttpLambda
 * @template CE - SQS Event
 * @template CR - SQS Batch Response
 * @template CC - Context type
 * @example new HttpLambda<ApiGatewayProxyEvent, ApiGatewayProxyResult>()
 */
export class SqsLambda<CE = SqsEvent, CR = SQSBatchResponse, CC = LambdaContext> extends CloudomiumLambda<CE, CC, CR> {
    queue(id: string, name: string) {
        return this.metadata(ResourceType.Sqs.ID, id).metadata(ResourceType.Sqs.QUEUE, name)
    }

    eventSourceMapping(props: SqsEventSourceMappingProps) {
        return this.metadata(ResourceType.Sqs.EVENT_SOURCE_MAPPING, props)
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
                    event.Records = event.Records.map((record: SqsRecord) => {
                        record.body = JSON.parse(gunzipSync(Buffer.from(record.body as string, 'base64')).toString('utf-8'))
                        return record
                    })
                }

                const result = await handler(event, context)
                if (result) response = result
            } catch (e) {
                const err = e as Error
                if (onError) return onError(err)

                // @ts-ignore
                response.batchItemFailures.push(...event.Records.map((record: SqsRecord) => ({ itemIdentifier: record.messageId })))

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
