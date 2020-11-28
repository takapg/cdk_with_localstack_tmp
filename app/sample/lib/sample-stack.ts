import * as sns from '@aws-cdk/aws-sns';
import * as subs from '@aws-cdk/aws-sns-subscriptions';
import * as sqs from '@aws-cdk/aws-sqs';
import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import { Duration } from '@aws-cdk/core';

export class SampleStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, 'SampleMyCdkQueue', {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    const topic = new sns.Topic(this, 'SampleMyCdkTopic');

    topic.addSubscription(new subs.SqsSubscription(queue));

    const table = new dynamodb.Table(this, 'tmp-table', {
      partitionKey: {
        name: 'itemId',
        type: dynamodb.AttributeType.STRING
      },
      tableName: 'tmp-table',
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    console.log(process.env.LOCALSTACK_HOSTNAME);

    const func = new lambda.Function(this, 'tmp-func', {
      code: new lambda.AssetCode('functions/tmp-func'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      timeout: Duration.minutes(1),
      environment: {
        TABLE_NAME: table.tableName,
        PRIMARY_KEY: 'itemId',
        DYNAMODB_ENDPOINT: process.env.LOCALSTACK_HOSTNAME || ''
      }
    });

    table.grantReadData(func);

    const api = new apigateway.RestApi(this, 'tmpApi', {
      restApiName: 'tmpAPI'
    });
    const items = api.root.addResource('items');
    const singleItem = items.addResource('{id}')
    const getItemIntegration = new apigateway.LambdaIntegration(func);
    singleItem.addMethod("GET", getItemIntegration);
    addCorsOptions(items);

    const realtimeTable = new dynamodb.Table(this, 'realtime-table', {
      partitionKey: {
        name: 'No',
        type: dynamodb.AttributeType.NUMBER
      },
      tableName: 'realtime-table',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
    });

    const realtimeFunc = new lambda.Function(this, 'realtime-func', {
      functionName: 'realtime-func',
      code: new lambda.AssetCode('functions/realtime-func'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      timeout: Duration.minutes(1),
      environment: {
        TABLE_NAME: realtimeTable.tableName,
        PRIMARY_KEY: 'No',
        HOSTNAME: process.env.LOCALSTACK_HOSTNAME || ''
      }
    });

    realtimeTable.grantReadWriteData(realtimeFunc);

    if (realtimeTable.tableStreamArn) {
      realtimeFunc.addEventSourceMapping("realtime-stream", {
        eventSourceArn: realtimeTable.tableStreamArn,
        batchSize: 10,
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        parallelizationFactor: 10
      });
    }


    const strTestTable = new dynamodb.Table(this, 'str-test-table', {
      partitionKey: {
        name: 'TestNo',
        type: dynamodb.AttributeType.NUMBER
      },
      tableName: 'str-test-table',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
    });

    const strTestFunc = new lambda.Function(this, 'str-test-func', {
      functionName: 'str-test-func',
      code: new lambda.AssetCode('functions/str-test-func'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      timeout: Duration.minutes(1),
      environment: {
        TABLE_NAME: strTestTable.tableName,
        PRIMARY_KEY: 'TestNo',
        HOSTNAME: process.env.LOCALSTACK_HOSTNAME || ''
      }
    });

    strTestTable.grantReadWriteData(strTestFunc);

    if (strTestTable.tableStreamArn) {
      strTestFunc.addEventSourceMapping("str-test-stream", {
        eventSourceArn: strTestTable.tableStreamArn,
        batchSize: 10,
        startingPosition: lambda.StartingPosition.TRIM_HORIZON
      });
    }
  }
}

export function addCorsOptions(apiResource: apigateway.IResource) {
  apiResource.addMethod(
  "OPTIONS",
  new apigateway.MockIntegration({
  integrationResponses: [
  {
  statusCode: "200",
  responseParameters: {
    "method.response.header.Access-Control-Allow-Headers":
    "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
    "method.response.header.Access-Control-Allow-Origin": "'*'",
    "method.response.header.Access-Control-Allow-Credentials":
    "'false'",
    "method.response.header.Access-Control-Allow-Methods":
    "'OPTIONS,GET,PUT,POST,DELETE'",
  },
  },
  ],
  passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
  requestTemplates: {
    "application/json": '{"statusCode": 200}',
  },
  }),
    {
    methodResponses: [
      {
        statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
      },
    ],
    }
  );
}
