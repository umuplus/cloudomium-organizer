import { Context } from 'aws-lambda'

export interface LambdaContext extends Context {
    claims?: Record<string, any>
}
