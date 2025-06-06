import { DynamoDB, ApiGatewayManagementApi } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamo = new DynamoDB.DocumentClient();
const messagesTable = process.env.MESSAGES_TABLE!;
const connectionsTable = process.env.CONNECTIONS_TABLE!;

export const handler = async (event: any) => {
  const connectionId = event.requestContext.connectionId;
  const domainName = event.requestContext.domainName;
  const stage = event.requestContext.stage;

  const apigw = new ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`,
  });

  try {
    const { threadId, senderId, text } = JSON.parse(event.body).payload;

    if (!threadId || !senderId || !text) {
      return { statusCode: 400, body: 'Missing fields' };
    }

    const createdAt = new Date().toISOString();
    const messageId = uuidv4();

    await dynamo.put({
      TableName: messagesTable,
      Item: {
        messageId,
        threadId,
        senderId,
        text,
        createdAt,
      },
    }).promise();

    // 2. Query all connections (broadcast to all)
    const connections = await dynamo.scan({
      TableName: connectionsTable,
    }).promise();

    const messageToSend = JSON.stringify({
      type: 'chat',
      payload: {
        messageId,
        threadId,
        senderId,
        text,
        createdAt,
      },
    });

    const postTasks = (connections.Items || []).map(async (conn: any) => {
      try {
        await apigw.postToConnection({
          ConnectionId: conn.connectionId,
          Data: messageToSend,
        }).promise();
      } catch (err) {
        if ((err as any).statusCode === 410) {
          // stale connection — optional: remove from DB
        } else {
          console.error('Failed to post to', conn.connectionId, err);
        }
      }
    });

    await Promise.all(postTasks);

    return {
      statusCode: 200,
      body: 'Message sent',
    };
  } catch (err) {
    console.error('chat.ts error:', err);
    return {
      statusCode: 500,
      body: 'Internal error',
    };
  }
};
