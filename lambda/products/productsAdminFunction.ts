import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { Product, ProductRepository } from "./layers/productsLayer/nodejs/productRepository"
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
  
  
  if (event.resource === "/products" && method === "POST") {
    console.log('POST')
    const product = JSON.parse(event.body!) as Product
    const productSaved = await productRepository.create(product)
    return Promise.resolve({
      statusCode: 201,
      body: JSON.stringify(productSaved)
    })
  }
  
  else if (event.resource === "/products/{id}") {
    const productId = event.pathParameters!.id as string;
    if (method === "PUT") {
      const product = JSON.parse(event.body!) as Product
      console.log(`PUT products/${productId}`)
  
      try {
        const productSaved = await productRepository.updateProduct(productId, product)
        return Promise.resolve({
          statusCode: 200,
          body: JSON.stringify(productSaved)
        })
      } catch (error) {
        return Promise.resolve({
          statusCode: 404,
          body: 'Product not found'
        })
      }
    }
    else if (method === "DELETE") {
        console.log(`DELETE products/${productId}`)

        try {
          const productDeleted = await productRepository.deleteProduct(productId)
          return Promise.resolve({
            statusCode: 200,
            body: JSON.stringify(productDeleted)
          })
        } catch (error) {
          console.error((<Error>error).message)
          return Promise.resolve({
            statusCode: 404,
            body: (<Error>error).message
          })
        }
    }
  }

  return Promise.resolve({
    statusCode: 400,
    body: JSON.stringify({
      message: "BAD REQUEST"
    })
  })
}