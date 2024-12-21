import { KinesisStreamEvent, KinesisStreamRecord, KinesisStreamRecordPayload } from 'aws-lambda'

export interface KinesisRecordPayload<T = any> extends Omit<KinesisStreamRecordPayload, 'data'> {
    data: T
}

export interface KinesisRecord<T = any> extends Omit<KinesisStreamRecord, 'kinesis'> {
    kinesis: KinesisRecordPayload<T>
}

export interface KinesisEvent<T = any> extends Omit<KinesisStreamEvent, 'Records'> {
    Records: KinesisRecord<T>[]
}

export interface KinesisStreamEventSourceMappingProps {
    batchSize: number
    reportBatchItemFailures: boolean
}