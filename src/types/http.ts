import { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult, APIGatewayProxyResultV2 } from 'aws-lambda'

export enum HttpMethod {
    'ANY' = 'ANY',
    'GET' = 'GET',
    'POST' = 'POST',
    'PUT' = 'PUT',
    'DELETE' = 'DELETE',
    'HEAD' = 'HEAD',
    'PATCH' = 'PATCH',
    'OPTIONS' = 'OPTIONS',
}

export interface ApiGatewayProxyEvent<T = any> extends Omit<APIGatewayProxyEvent, 'body'> {
    body: T
}

export interface ApiGatewayProxyEventV2<T = any> extends Omit<APIGatewayProxyEventV2, 'body'> {
    body: T
}

export interface ApiGatewayProxyEvent<T = any> extends Omit<APIGatewayProxyEvent, 'body'> {
    body: T
}

export interface ApiGatewayProxyEventV2<T = any> extends Omit<APIGatewayProxyEventV2, 'body'> {
    body: T
}

export interface ApiGatewayProxyResult<T = any> extends Omit<APIGatewayProxyResult, 'body'> {
    body?: T
}

export interface ApiGatewayProxyResultV2<T = any> extends Omit<APIGatewayProxyResultV2, 'body'> {
    body?: T
}
