#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ECommerceApiStack } from '../lib/eCommerceApi-stack';
import { ProductsAppStack } from '../lib/productsApp-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: "638508268709",
  region: "us-east-1",
}

const tags = {
  cost: "ECommerce",
  team: "CássioTeam"
}

const productAppStack = new ProductsAppStack(app, "ProductsApp", {
  tags,
  env
})
const eCommerceApiStack = new ECommerceApiStack(app, "ECommerceApi", {
  productsFetchHandler: productAppStack.productsFetchHandler,
  tags,
  env,
})


// This is only for purpose to make clear the stack dependencies
eCommerceApiStack.addDependency(productAppStack)