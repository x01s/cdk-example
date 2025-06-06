import {ApiGatewayManagementApi} from 'aws-sdk';
import {handler as handleChat} from './chat';

export const handler = async (event: any) => {
  const connectionId = event.requestContext.connectionId;
  const domainName = event.requestContext.domainName;
  const stage = event.requestContext.stage;

  const apigw = new ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`,
  });

  try {
    const body = JSON.parse(event.body || '{}');
    const type = body.type;
    const payload = body.payload;

    if (!type) {
      throw new Error('Missing message type');
    }

    console.log(`[message] from ${connectionId} | type: ${type}`, payload);

    switch (type) {
      case 'ping':
        await apigw.postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify({type: 'pong', timestamp: Date.now()}),
        }).promise();
        break;

      case 'chat':
        await handleChat({
          ...event,
          body: JSON.stringify({payload})
        });
        break;

      default:
        await apigw.postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify({error: `Unsupported message type: ${type}`}),
        }).promise();
        break;
    }

    return {
      statusCode: 200,
      body: 'Message processed',
    };
  } catch (err) {
    console.error('Error in message handler:', err);

    try {
      await apigw.postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({error: 'Invalid message format or server error'}),
      }).promise();
    } catch (_) {
    }

    return {
      statusCode: 400,
      body: 'Bad request',
    };
  }
};
