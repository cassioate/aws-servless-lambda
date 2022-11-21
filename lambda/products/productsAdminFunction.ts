import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { DynamoDB } from "aws-sdk"
import { Product, ProductRepository } from "./layers/productsLayer/nodejs/productRepository"

const productsDdb = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()

const productRepository = new ProductRepository(ddbClient, productsDdb)

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod

  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;
  
  console.log(`API Gateway RequestID: ${apiRequestId} - Lambda execution RequestID: ${lambdaRequestId}`)

    if (event.resource === "/products" && method === "POST") {
      console.log('POST')
      const product = JSON.parse(event.body!) as Product
      const productSaved = await productRepository.create(product)
      return Promise.resolve({
        statusCode: 201,
        body: JSON.stringify(productSaved)
      })
    }
  
    else if (event.resource === "/products/{id}" && method === "PUT") {
      const productId = event.pathParameters!.id as string;
      console.log(`PUT products/${productId}`)
  
      return Promise.resolve({
        statusCode: 200,
        body: JSON.stringify({
          message: `PUT products/${productId}`
        })
      })
    }

    else if (event.resource === "/products/{id}" && method === "DELETE") {
      const productId = event.pathParameters!.id as string;
      console.log(`DELETE products/${productId}`)
  
      return Promise.resolve({
        statusCode: 200,
        body: JSON.stringify({
          message: `DELETE products/${productId}`
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