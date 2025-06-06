import { DynamoDB } from 'aws-sdk';

const dynamo = new DynamoDB.DocumentClient();
const tableName = process.env.CONNECTIONS_TABLE!;

export const handler = async (event: any) => {
  const connectionId = event.requestContext.connectionId;

  console.log('WebSocket disconnect:', connectionId);

  try {
    await dynamo.delete({
      TableName: tableName,
      Key: { connectionId },
    }).promise();

    return {
      statusCode: 200,
      body: 'Disconnected',
    };
  } catch (err) {
    console.error('Error deleting connection:', err);
    return {
      statusCode: 500,
      body: 'Failed to disconnect',
    };
  }
};
