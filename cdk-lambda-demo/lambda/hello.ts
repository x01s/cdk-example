// File: lambda/hello.ts
export async function handler(event: any) {
  return {
    statusCode: 200,
    body: "Hello from Lambda & CDK with CI/CD!",
  };
}


