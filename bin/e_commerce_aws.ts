#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ECommerceApiStack } from '../lib/eCommerceApi-stack';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ProductsAppLayersStack } from '../lib/productsAppLayers-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: "638508268709",
  region: "us-east-1",
}

const tags = {
  cost: "ECommerce",
  team: "CássioTeam"
}

const productsAppLayersStack = new ProductsAppLayersStack(app, "ProductsAppLayers", {
  tags: tags,
  env: env
})

const productAppStack = new ProductsAppStack(app, "ProductsApp", {
  tags,
  env
})

productAppStack.addDependency(productsAppLayersStack)

const eCommerceApiStack = new ECommerceApiStack(app, "ECommerceApi", {
  productsFetchHandler: productAppStack.productsFetchHandler,
  productsAdminHandler: productAppStack.productsAdminHandler,
  tags,
  env,
})


// This is only for purpose to make clear the stack dependencies
eCommerceApiStack.addDependency(productAppStack)