import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();
const tableName = process.env.CONNECTIONS_TABLE!;

export const handler = async (event: any) => {
  const connectionId = event.requestContext.connectionId;
  const timestamp = new Date().toISOString();

  console.log('New WebSocket connection:', connectionId);

  try {
    await dynamo.put({
      TableName: tableName,
      Item: {
        connectionId,
        connectedAt: timestamp,
      },
    }).promise();

    return {
      statusCode: 200,
      body: 'Connected',
    };
  } catch (err) {
    console.error('Error saving connection:', err);
    return {
      statusCode: 500,
      body: 'Failed to connect',
    };
  }
};
