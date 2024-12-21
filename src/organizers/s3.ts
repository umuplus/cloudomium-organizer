import { CloudomiumLambda } from './_lambda'
import { ErrorHandler, Handler } from '../types/middleware'
import { LambdaContext } from '../types/lambda'
import { ResourceType } from '../types/aws'
import { S3BucketEvent, S3EventSourceMappingProps } from '../types/s3'

/**
 * Lambda organizer with middleware support for S3 events
 * @class S3Lambda
 * @template CE - S3 Event
 * @template CR - string | undefined
 * @template CC - Context type
 * @example new S3Lambda<S3BucketEvent, string | undefined>()
 */
export class S3Lambda<CE = S3BucketEvent, CR = string | undefined | void, CC = LambdaContext> extends CloudomiumLambda<CE, CC, CR> {
    bucket(id: string, name: string) {
        return this.metadata(ResourceType.S3.ID, id).metadata(ResourceType.S3.BUCKET, name)
    }

    eventSourceMapping(props: S3EventSourceMappingProps) {
        return this.metadata(ResourceType.S3.EVENT_SOURCE_MAPPING, props)
    }

    /**
     * Assigns the handler function
     * @param {Handler<CE, CC, CR>} handler - Handler to be executed
     * @param {ErrorHandler<CR>} [onError] - Error handler for the handler
     * @returns {Handler<CE, CC, CR>}
     */
    execute(handler: Handler<CE, CC, CR>, onError?: ErrorHandler<CR>): Handler<CE, CC, CR> {
        return async (event: CE, context: CC): Promise<CR> => {
            let response: CR = undefined as CR
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
                const result = await handler(event, context)
                if (result) response = result
            } catch (e) {
                const err = e as Error
                if (onError) return onError(err)

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
