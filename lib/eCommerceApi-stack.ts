import * as cdk from "aws-cdk-lib"
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs"
import * as cwLogs from "aws-cdk-lib/aws-logs"
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs"

interface ECommerceApiStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNodeJs.NodejsFunction
  productsAdminHandler: lambdaNodeJs.NodejsFunction
}

export class ECommerceApiStack extends cdk.Stack {
  readonly api: cdk.aws_apigateway.RestApi
  readonly logGroup: cdk.aws_logs.LogGroup

  constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
    super(scope, id, props)

    this.logGroup = new cwLogs.LogGroup(this, "ECommerceApiLogs")
    this.api = new apiGateway.RestApi(this, 'ECommerceApi', {
      // This cloudWatchRole need to be true or is gonna happen a error in the deploy
      cloudWatchRole: true,
      restApiName: 'ECommerceApi',
      deployOptions: {
        accessLogDestination: new apiGateway.LogGroupLogDestination(this.logGroup),
        accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: true
        })
      }
    })

    const productResource = this.api.root.addResource("products")
    const productIdResource = productResource.addResource("{id}")

    this.productsFetchIntegrationConstructor(props, productResource, productIdResource)
    this.productsAdminIntegrationConstructor(props, productResource, productIdResource)
  }

  // GET | /products
  async productsFetchIntegrationConstructor(props: ECommerceApiStackProps, 
    productResource: cdk.aws_apigateway.Resource, productIdResource: cdk.aws_apigateway.Resource): Promise<void> {
    
      const productsFetchIntegration = new apiGateway.LambdaIntegration(props.productsFetchHandler)
    productResource.addMethod("GET", productsFetchIntegration)
    productIdResource.addMethod("GET", productsFetchIntegration)
  }

  // POST - PUT - DELETE | /products
  async productsAdminIntegrationConstructor(props: ECommerceApiStackProps, 
    productResource: cdk.aws_apigateway.Resource, productIdResource: cdk.aws_apigateway.Resource): Promise<void> {

    const productsAdminIntegration = new apiGateway.LambdaIntegration(props.productsAdminHandler)
    productResource.addMethod("POST", productsAdminIntegration)  
    productIdResource.addMethod("PUT", productsAdminIntegration)
    productIdResource.addMethod("DELETE", productsAdminIntegration)
  }
}