import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DynamoDBStack extends Stack {
  public readonly threadsTable: dynamodb.Table;
  public readonly messagesTable: dynamodb.Table;
  public readonly connectionsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.threadsTable = new dynamodb.Table(this, 'Threads', {
      partitionKey: { name: 'threadId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.messagesTable = new dynamodb.Table(this, 'Messages', {
      partitionKey: { name: 'messageId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.connectionsTable = new dynamodb.Table(this, 'Connections', {
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }
}
