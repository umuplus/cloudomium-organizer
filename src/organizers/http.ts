import { ApiGatewayProxyEvent, ApiGatewayProxyEventV2, ApiGatewayProxyResult, ApiGatewayProxyResultV2, HttpMethod } from '../types/http'
import { CloudomiumLambda } from './_lambda'
import { ErrorHandler, Handler } from '../types/middleware'
import { LambdaContext } from '../types/lambda'
import { ResourceType } from '../types/aws'

/**
 * Lambda organizer with middleware support for HTTP events
 * @class HttpLambda
 * @template CE - HTTP Request type
 * @template CR - HTTP Response type
 * @template CC - Context type
 * @example new HttpLambda<ApiGatewayProxyEvent, ApiGatewayProxyResult>()
 */
export class HttpLambda<
    CE = ApiGatewayProxyEvent | ApiGatewayProxyEventV2,
    CR = ApiGatewayProxyResult | ApiGatewayProxyResultV2,
    CC = LambdaContext,
> extends CloudomiumLambda<CE, CC, CR> {
    route(path: string, methods = [HttpMethod.ANY]): this {
        return this.metadata(ResourceType.Http.PATH, path).metadata(ResourceType.Http.METHODS, methods)
    }

    /**
     * Assigns the handler function
     * @param {Handler<CE, CC, CR>} handler - Handler to be executed
     * @param {ErrorHandler<CR>} [onError] - Error handler for the handler
     * @returns {Handler<CE, CC, CR>}
     */
    execute(handler: Handler<CE, CC, CR>, onError?: ErrorHandler<CR>): Handler<CE, CC, CR> {
        return async (event: CE, context: CC): Promise<CR> => {
            for (const { middleware, onError } of this.onBefore) {
                try {
                    const result = await middleware(event, context)
                    if (result) return result
                } catch (e) {
                    const err = e as Error
                    if (onError) return onError(err)

                    return {
                        statusCode: 500,
                        body: JSON.stringify({
                            message: 'Something went wrong',
                            reason: err.message,
                            middleware: middleware.name,
                        }),
                    } as CR
                }
            }

            let response = { statusCode: 204 } as CR
            try {
                const result = await handler(event, context)
                if (result) response = result
            } catch (e) {
                const err = e as Error
                if (onError) return onError(err)

                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: 'Something went wrong',
                        reason: err.message,
                        handler: true,
                    }),
                } as CR
            }

            for (const { middleware, onError } of this.onAfter) {
                try {
                    const result = await middleware(event, context, response)
                    if (result) return result
                } catch (e) {
                    const err = e as Error
                    if (onError) return onError(err)

                    return {
                        statusCode: 500,
                        body: JSON.stringify({
                            message: 'Something went wrong',
                            reason: err.message,
                            middleware: middleware.name,
                        }),
                    } as CR
                }
            }

            // @ts-ignore
            if (response?.body && typeof response.body !== 'string') response.body = JSON.stringify(response.body)
            return response
        }
    }
}
