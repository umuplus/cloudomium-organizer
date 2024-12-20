import { Context } from 'aws-lambda'

export interface LambdaProps {
    runtime: string
    timeout: number
    memorySize: number
    handler: string
    environment?: Record<string, string>
    layers?: any[]
    logRetention: number
}

export interface LambdaContext extends Context {
    claims?: Record<string, any>
}
