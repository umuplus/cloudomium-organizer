enum ApiGatewayResourceType {
    'ID' = 'API_GATEWAY_ID',
    'CERTIFICATE_ARN' = 'API_GATEWAY_CERTIFICATE_ARN',
    'DOMAIN_NAME' = 'API_GATEWAY_DOMAIN_NAME',
}

enum CloudfrontResourceType {
    'ID' = 'CLOUDFRONT_ID',
    'CERTIFICATE_ARN' = 'CLOUDFRONT_CERTIFICATE_ARN',
    'DOMAIN_NAME' = 'CLOUDFRONT_DOMAIN_NAME',
}

enum CodebaseResourceType {
    'HASH' = 'CODEBASE_HASH',
    'PATH' = 'CODEBASE_PATH',
}

enum DynamodbResourceType {
    'ID' = 'DYNAMODB_ID',
    'TABLE' = 'DYNAMODB_TABLE',
    'STREAM' = 'DYNAMODB_STREAM',
    'EVENT_SOURCE_MAPPING' = 'DYNAMODB_EVENT_SOURCE_MAPPING',
}

enum HttpResourceType {
    'METHODS' = 'HTTP_METHODS',
    'PATH' = 'HTTP_PATH',
}

enum KinesisResourceType {
    'ID' = 'KINESIS_ID',
    'STREAM' = 'KINESIS_STREAM',
    'EVENT_SOURCE_MAPPING' = 'KINESIS_EVENT_SOURCE_MAPPING',
}

enum LambdaResourceType {
    'ID' = 'LAMBDA_ID',
    'FUNCTION' = 'LAMBDA_FUNCTION',
}

enum S3ResourceType {
    'ID' = 'S3_ID',
    'BUCKET' = 'S3_BUCKET',
    'EVENT_SOURCE_MAPPING' = 'S3_EVENT_SOURCE_MAPPING',
}

enum SnsResourceType {
    'ID' = 'SNS_ID',
    'TOPIC' = 'SNS_TOPIC',
    'EVENT_SOURCE_MAPPING' = 'SNS_EVENT_SOURCE_MAPPING',
}

enum SqsResourceType {
    'ID' = 'SQS_ID',
    'QUEUE' = 'SQS_QUEUE',
    'EVENT_SOURCE_MAPPING' = 'SQS_EVENT_SOURCE_MAPPING',
}

export const ResourceType = {
    ApiGateway: ApiGatewayResourceType,
    Cloudfront: CloudfrontResourceType,
    Codebase: CodebaseResourceType,
    Dynamodb: DynamodbResourceType,
    Http: HttpResourceType,
    Kinesis: KinesisResourceType,
    Lambda: LambdaResourceType,
    S3: S3ResourceType,
    Sns: SnsResourceType,
    Sqs: SqsResourceType,
}

export type ResourceType = typeof ResourceType
