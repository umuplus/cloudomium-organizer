import { S3Event, S3EventRecord } from 'aws-lambda'

export interface S3BucketEventRecordPayload<T> {
    s3SchemaVersion: string
    configurationId: string
    bucket: {
        name: string
        ownerIdentity: {
            principalId: string
        }
        arn: string
    }
    object: {
        key: string
        size: number
        eTag: string
        versionId?: string | undefined
        sequencer: string
        body?: T
    }
}

export interface S3BucketEventRecord<T = any> extends Omit<S3EventRecord, 's3'> {
    s3: S3BucketEventRecordPayload<T>
    error?: Error
}

export interface S3BucketEvent<T = any> extends Omit<S3Event, 'Records'> {
    Records: S3BucketEventRecord<T>[]
}

export interface S3EventSourceMappingProps {
    events: string[]
}
