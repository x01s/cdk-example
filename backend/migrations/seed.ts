import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'ap-southeast-1' });

const run = async () => {
  await client.send(
    new PutItemCommand({
      TableName: 'Threads',
      Item: {
        threadId: { S: 'test-thread' },
      },
    })
  );

  await client.send(
    new PutItemCommand({
      TableName: 'Messages',
      Item: {
        messageId: { S: 'msg-001' },
        createdAt: { S: new Date().toISOString() },
        threadId: { S: 'test-thread' },
        content: { S: 'Hello, this is a test message.' },
      },
    })
  );

  console.log('Seeded test data');
};

run().catch(console.error);
