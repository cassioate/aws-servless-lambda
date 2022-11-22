import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { ProductRepository } from "./layers/productsLayer/nodejs/productRepository"
import { DynamoDB } from "aws-sdk"

import * as AWSXRay from "aws-xray-sdk"

AWSXRay.captureAWS(require("aws-sdk"))

const productsDdb = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()

const productRepository = new ProductRepository(ddbClient, productsDdb)

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod

  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;
  
  console.log(`API Gateway RequestID: ${apiRequestId} - Lambda execution RequestID: ${lambdaRequestId}`)

  if (method === "GET") {
    if (event.resource === "/products") {
      console.log('GET')

      const products = await productRepository.getAllProducts()

      return Promise.resolve({
        statusCode: 200,
        body: JSON.stringify(products)
      })
    }
  
    else if (event.resource === "/products/{id}") {
      const productId = event.pathParameters!.id as string;
      console.log(`GET products/${productId}`)

      const product = await productRepository.getProductById(productId)

      return Promise.resolve({
        statusCode: 200,
        body: JSON.stringify(product)
      })
    }
  }

  return Promise.resolve({
    statusCode: 400,
    body: JSON.stringify({
      message: "BAD REQUEST"
    })
  })
}