import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

interface DynamoTableRefs {
  messagesTable: dynamodb.Table;
  threadsTable: dynamodb.Table;
  connectionsTable: dynamodb.Table;
}

interface LambdaStackProps extends StackProps {
  dynamoTables: DynamoTableRefs;
}

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const { messagesTable, threadsTable, connectionsTable } = props.dynamoTables;

    const sharedEnv = {
      MESSAGES_TABLE: messagesTable.tableName,
      THREADS_TABLE: threadsTable.tableName,
      CONNECTIONS_TABLE: connectionsTable.tableName,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '', // optional
    };

    const createFn = (name: string) =>
      new lambda.Function(this, `${name}Fn`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset('lambda'),
        handler: `${name}.handler`,
        timeout: Duration.seconds(10),
        environment: sharedEnv,
      });

    const helloFn = createFn('hello');

    messagesTable.grantReadWriteData(helloFn);
    threadsTable.grantReadWriteData(helloFn);
    connectionsTable.grantReadWriteData(helloFn);
  }
}
