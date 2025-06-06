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

interface LambdaStackProps extends StackProps {
  dynamoTables: DynamoTableRefs;
}

export class LambdaStack extends Stack {
  public readonly apiUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const { messagesTable } = props.dynamoTables;

    const getThreadFn = new lambda.Function(this, 'GetThreadFn', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'getThread.handler',
      timeout: Duration.seconds(10),
      environment: {
        MESSAGES_TABLE: messagesTable.tableName,
      },
    });

    messagesTable.grantReadData(getThreadFn);

    const httpApi = new apigateway.HttpApi(this, 'ThreadHttpApi', {
      apiName: 'GetThreadAPI',
    });

    httpApi.addRoutes({
      path: '/threads/{threadId}',
      methods: [apigateway.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('GetThreadIntegration', getThreadFn),
    });

    this.apiUrl = new cdk.CfnOutput(this, 'GetThreadApiUrl', {
      value: httpApi.apiEndpoint,
    });
  }
}
