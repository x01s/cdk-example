import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();
const tableName = process.env.MESSAGES_TABLE!;

export const handler = async (event: any) => {
  const threadId = event.pathParameters?.threadId;

  if (!threadId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing threadId' }),
    };
  }

  const result = await dynamo.query({
    TableName: tableName,
    IndexName: 'threadId-index',
    KeyConditionExpression: 'threadId = :t',
    ExpressionAttributeValues: {
      ':t': threadId,
    },
    ScanIndexForward: true,
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
};
