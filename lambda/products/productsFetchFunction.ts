import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"

// export async function handler (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  
// }

export const handler = (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod

  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;
  
  console.log(`API Gateway RequestID: ${apiRequestId} - Lambda execution RequestID: ${lambdaRequestId}`)

  if (event.resource === "/products" && method === "GET") {
    console.log('GET')
    return Promise.resolve({
      statusCode: 200,
      body: JSON.stringify({
        message: "GET Products - OK"
      })
    })
  }

  return Promise.resolve({
    statusCode: 400,
    body: JSON.stringify({
      message: "BAD REQUEST"
    })
  })
}