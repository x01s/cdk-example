export const handler = async (event: any) => {
  console.log('Message event:', JSON.stringify(event));
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Message received!' }),
  };
};
