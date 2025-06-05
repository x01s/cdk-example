import { ApiGatewayManagementApi, DynamoDB } from 'aws-sdk';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const dynamo = new DynamoDB.DocumentClient();
const MESSAGES_TABLE = process.env.MESSAGES_TABLE_NAME!;

export const handler = async (event: any) => {
  const { requestContext, body } = event;
  const connectionId = requestContext.connectionId;
  const domainName = requestContext.domainName;
  const stage = requestContext.stage;

  const apiGateway = new ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`,
  });

  let messageText = 'Hello';
  let threadId = 'default-thread';
  let sender = 'anonymous';

  try {
    const message = JSON.parse(body);
    messageText = message.text || 'Hello';
    threadId = message.threadId || 'default-thread';
    sender = message.sender || 'anonymous';
  } catch (err) {
    console.error('Invalid JSON:', body);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: messageText }],
    });

    const reply = completion.choices[0]?.message.content || 'Sorry, I have no response.';
    const createdAt = new Date().toISOString();
    const messageId = uuidv4();

    await dynamo.put({
      TableName: MESSAGES_TABLE,
      Item: {
        messageId,
        threadId,
        sender,
        content: messageText,
        reply,
        createdAt,
      },
    }).promise();

    await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify({ reply, messageId, createdAt }),
    }).promise();

    return { statusCode: 200 };
  } catch (error) {
    console.error('Chat error:', error);

    await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify({ error: 'Failed to get reply from ChatGPT' }),
    }).promise();

    return { statusCode: 500 };
  }
};
