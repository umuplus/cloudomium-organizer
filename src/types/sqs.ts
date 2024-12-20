import { SQSEvent, SQSRecord } from 'aws-lambda'

export interface SqsRecord<T = any> extends Omit<SQSRecord, 'body'> {
    body: T
}

export interface SqsEvent<T = any> extends Omit<SQSEvent, 'Records'> {
    Records: SqsRecord<T>[]
}

export interface SqsEventSourceMappingProps {
    batchSize: number
    reportBatchItemFailures: boolean
}