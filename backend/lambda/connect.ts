export const handler = async (event: any) => {
  console.log('Connect event:', JSON.stringify(event));
  return { statusCode: 200, body: 'Connected' };
};
