import { Stack, StackProps, Duration, aws_secretsmanager as secretsmanager, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

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

    const openAiSecret = secretsmanager.Secret.fromSecretNameV2(this, 'OpenAiApiKeySecret', 'OpenAIApiKey');

    const sharedEnv = {
      MESSAGES_TABLE: messagesTable.tableName,
      THREADS_TABLE: threadsTable.tableName,
      CONNECTIONS_TABLE: connectionsTable.tableName,
      OPENAI_API_KEY_SECRET_NAME: openAiSecret.secretName,
    };

    const routeConfigs = [
      { name: 'connect', routeKey: '$connect' },
      { name: 'disconnect', routeKey: '$disconnect' },
      { name: 'message', routeKey: '$default' },
      { name: 'chat', routeKey: 'chat' },
    ];

    const lambdaMap: Record<string, lambda.Function> = {};

    for (const { name } of routeConfigs) {
      const fn = new lambda.Function(this, `${name}Fn`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset('lambda'),
        handler: `${name}.handler`,
        timeout: Duration.seconds(10),
        environment: sharedEnv,
      });

      messagesTable.grantReadWriteData(fn);
      threadsTable.grantReadWriteData(fn);
      connectionsTable.grantReadWriteData(fn);

      openAiSecret.grantRead(fn);

      lambdaMap[name] = fn;
    }

    this.webSocketApi = new apigateway.WebSocketApi(this, 'ChatWebSocketApi', {
      connectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration('ConnectIntegration', lambdaMap['connect']),
      },
      disconnectRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration('DisconnectIntegration', lambdaMap['disconnect']),
      },
      defaultRouteOptions: {
        integration: new integrations.WebSocketLambdaIntegration('DefaultIntegration', lambdaMap['message']),
      },
    });

    this.webSocketApi.addRoute('chat', {
      integration: new integrations.WebSocketLambdaIntegration('ChatIntegration', lambdaMap['chat']),
    });

    new apigateway.WebSocketStage(this, 'ChatWebSocketStage', {
      webSocketApi: this.webSocketApi,
      stageName: 'staging',
      autoDeploy: true,
    });

    new CfnOutput(this, 'WebSocketURL', {
      value: this.webSocketApi.apiEndpoint,
    });
  }
}
