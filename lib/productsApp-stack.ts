import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import * as ssm from "aws-cdk-lib/aws-ssm"
import * as dynamoDB from "aws-cdk-lib/aws-dynamodb"
import { Construct } from "constructs"

export class ProductsAppStack extends cdk.Stack {
  readonly productsFetchHandler: lambdaNodeJs.NodejsFunction;
  readonly productsAdminHandler: lambdaNodeJs.NodejsFunction;
  readonly productsDdb: dynamoDB.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, "ProductsLayerVersionArn");
    const productLayer = lambda.LayerVersion.fromLayerVersionArn(this, "ProductsLayerVersionArn", productsLayerArn);
    const arrayOfLayers = [productLayer]

    this.productsDdb = this.constructorDataBase()
    this.productsFetchHandler = this.productsFetchHandlerConstructor(arrayOfLayers)
    this.productsAdminHandler = this.productsAdminHandlerConstructor(arrayOfLayers)
    this.grants()
  }

  grants(): void {
    this.productsDdb.grantReadData(this.productsFetchHandler)
    this.productsDdb.grantWriteData(this.productsAdminHandler)
  }

  constructorDataBase(): cdk.aws_dynamodb.Table {
    return new dynamoDB.Table(this, "ProductsDdb", {
      tableName: "products",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: dynamoDB.AttributeType.STRING
      },
      billingMode: dynamoDB.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1
    })
  }

  productsFetchHandlerConstructor(layers?: lambda.ILayerVersion[]): lambdaNodeJs.NodejsFunction {
    return new lambdaNodeJs.NodejsFunction(this, 'ProductsFetchFunction', {
      functionName: 'ProductsFetchFunction',
      entry: 'lambda/products/productsFetchFunction.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        PRODUCTS_DDB: this.productsDdb.tableName,
      },
      layers: layers,
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0
    })
  }

  productsAdminHandlerConstructor(layers?: lambda.ILayerVersion[]): lambdaNodeJs.NodejsFunction {
    return new lambdaNodeJs.NodejsFunction(this, 'ProductsAdminFunction', {
      functionName: 'ProductsAdminFunction',
      entry: 'lambda/products/productsAdminFunction.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        PRODUCTS_DDB: this.productsDdb.tableName,
      },
      layers: layers,
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0
    })
  }
}