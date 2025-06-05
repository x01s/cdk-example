#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DynamoDBStack } from './stacks/DynamoDBStack';
import { LambdaStack } from './stacks/LambdaStack';
import { WebSocketStack } from './stacks/WebSocketStack';

const app = new cdk.App();

const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

const dynamoStack = new DynamoDBStack(app, 'DynamoDBStack', { env });

const lambdaStack = new LambdaStack(app, 'LambdaStack', {
  env,
  dynamoTables: {
    messagesTable: dynamoStack.messagesTable,
    threadsTable: dynamoStack.threadsTable,
    connectionsTable: dynamoStack.connectionsTable,
  },
});

const webSocketStack = new WebSocketStack(app, 'WebSocketStack', {
  env,
  dynamoTables: {
    messagesTable: dynamoStack.messagesTable,
    threadsTable: dynamoStack.threadsTable,
    connectionsTable: dynamoStack.connectionsTable,
  },
});
