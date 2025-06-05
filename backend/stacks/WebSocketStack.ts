import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';

interface DynamoTableRefs {
  messagesTable: dynamodb.Table;
  threadsTable: dynamodb.Table;
  connectionsTable: dynamodb.Table;
}

interface WebSocketStackProps extends StackProps {
  dynamoTables: DynamoTableRefs;
}

export class WebSocketStack extends Stack {
  public readonly webSocketApi: apigateway.WebSocketApi;

  constructor(scope: Construct, id: string, props: WebSocketStackProps) {
    super(scope, id, props);

    const { messagesTable, threadsTable, connectionsTable } = props.dynamoTables;

    const sharedLambdaEnv = {
      MESSAGES_TABLE: messagesTable.tableName,
      THREADS_TABLE: threadsTable.tableName,
      CONNECTIONS_TABLE: connectionsTable.tableName,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '', // optional if using secret manager later
    };

    const createFn = (name: string) =>
      new lambda.Function(this, `${name}Fn`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset('lambda'),
        handler: `${name}.handler`,
        timeout: Duration.seconds(10),
        environment: sharedLambdaEnv,
      });

    const connectFn = createFn('connect');
    const disconnectFn = createFn('disconnect');
    const messageFn = createFn('message');
    const chatFn = createFn('chat');

    for (const fn of [connectFn, disconnectFn, messageFn, chatFn]) {
      messagesTable.grantReadWriteData(fn);
      threadsTable.grantReadWriteData(fn);
      connectionsTable.grantReadWriteData(fn);
    }

    this.webSocketApi = new apigateway.WebSocketApi(this, 'ChatWebSocketApi', {
      connectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration('ConnectIntegration', connectFn),
      },
      disconnectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration('DisconnectIntegration', disconnectFn),
      },
      defaultRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration('DefaultIntegration', messageFn),
      },
    });

    new apigateway.WebSocketStage(this, 'ChatWebSocketStage', {
      webSocketApi: this.webSocketApi,
      stageName: 'staging',
      autoDeploy: true,
    });

    new cdk.CfnOutput(this, 'WebSocketURL', {
      value: this.webSocketApi.apiEndpoint,
    });
  }
}
