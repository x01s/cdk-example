export const handler = async (event: any) => {
  console.log('Disconnect event:', JSON.stringify(event));
  return { statusCode: 200, body: 'Disconnected' };
};
