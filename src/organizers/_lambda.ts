import { ErrorHandler, Middleware } from '../types/middleware'
import { LambdaProps } from '../types/lambda';
import { ResourceType } from '../types/aws'

/**
 * Lambda organizer with middleware support
 * @class CloudomiumLambda
 * @template CE - Lambda Event
 * @template CC - Context type
 * @template CR - Response type
 */
export abstract class CloudomiumLambda<CE = unknown, CC = unknown, CR = unknown> {
    protected _metadata: Record<string, any> = {}
    protected onBefore: Array<{ middleware: Middleware<CE, CC, CR>; onError?: ErrorHandler<CR> }> = []
    protected onAfter: Array<{ middleware: Middleware<CE, CC, CR>; onError?: ErrorHandler<CR> }> = []

    /**
     * Assigns metadata configuration to the organizer.
     * If no value is provided, it returns the current value.
     * @param {ResourceType | string} key - Configuration key
     * @param {any} value - Configuration value
     * @returns {CloudomiumLambda<CE = unknown, CC = unknown, CR = unknown> | any}
     */
    metadata(key: string | ResourceType, value?: any): this | any {
        if (!value) return this._metadata[key as string]

        this._metadata[key as string] = value
        return this
    }

    /**
     * Assigns codebase configuration to the organizer.
     * @param {string} path - Path to the codebase
     * @param {string} [hash] - Hash of the codebase for detecting changes
     * @returns {CloudomiumLambda<CE = unknown, CC = unknown, CR = unknown>}
     */
    codebase(path: string, hash?: string) {
        return this.metadata(ResourceType.Codebase.PATH, path).metadata(ResourceType.Codebase.HASH, hash || Math.random().toString(36).substring(2))
    }

    /**
     * Assigns a lambda function configuration to the organizer.
     * @param {string} id - Logical ID of the lambda function
     * @param {LambdaProps} props - Lambda properties
     * @returns {CloudomiumLambda<CE = unknown, CC = unknown, CR = unknown>}
     */
    lambda(id: string, props?: LambdaProps) {
        if (props) this.metadata(ResourceType.Lambda.FUNCTION, props)
        return this.metadata(ResourceType.Lambda.ID, id)
    }

    /**
     * Adds a middleware to be executed before the handler
     * @param {Middleware<CE, CC, CR>} middleware - Middleware to be executed
     * @param {ErrorHandler<CR>} [onError] - Error handler for the middleware
     * @returns {CloudomiumLambda<CE = unknown, CC = unknown, CR = unknown>}
     */
    before(middleware: Middleware<CE, CC, CR>, onError?: ErrorHandler<CR>): this {
        this.onBefore.push({ middleware, onError })
        return this
    }

    /**
     * Adds a middleware to be executed after the handler
     * @param {Middleware<CE, CC, CR>} middleware - Middleware to be executed
     * @param {ErrorHandler<CR>} [onError] - Error handler for the middleware
     * @returns {CloudomiumLambda<CE = unknown, CC = unknown, CR = unknown>}
     */
    after(middleware: Middleware<CE, CC, CR>, onError?: ErrorHandler<CR>): this {
        this.onAfter.push({ middleware, onError })
        return this
    }
}
