

# WeTodos Serverless

WeTodos wechat mini-program 后台服务项目

[微信小程序客户端体验程序](https://github.com/zhongjixiuxing/WeTodos-miniprogram)：

<img align="left" width="150" height="150" src="https://ae01.alicdn.com/kf/Ha2cefce2dde94730ab017ceb910f5e99H.jpg">



## 技术栈

* **Nodejs10.x** + (Basic programming language)

* **Apollo Graphql** (API 接口标准)

* **Github Actions** (CI/CD)

* **Serverless** (FASS 函数计算简捷tool)

* **AWS Cloud Services** (Lambda、Dynamodb、Apigateway、S3、CloudFormation、CloudWatch)

* **Cloudflare** (Domain DNS Service)

  

## Setup

```shell
$ npm i
$ npm i -g serverless
```



## Startup (local)
3000(apollo server) and 8000 (local dynamodb) port will be using!
```shell
$ npm run start 
```



## Testing

```shell
$ npm run test
```



## Deploy to AWS Cloud
```shell
$ serverless deploy --config serverless.prod.yaml
```



## Todos
    - [] jest, dynamodb don't restart, should be clear table rows



## ISSUES
- [aws apigateway custom domain setting](https://medium.com/@maciejtreder/custom-domain-in-aws-api-gateway-a2b7feaf9c74)

    在cloudflare 与 aws apigateway 做绑定，然后将subdomain cloud flare change 记录指向aws apigateway 的自定义域名即可

- **本地测试环境**

    采用serverless-dynamodb-local 和 serverless-offline 这两个插件

- **不同环境怎样隔离**

    采用serverless 同一个APP下创建不同的service, 然后在AWS dynamodb 中创建不同的表即可

- **CI/CD**

    Github actions + serverless deploy 方案

- **删除Service**
  
  1. 在AWS CloudFormation 中找到对应的堆栈点击删除。如果删除遇到错误，根据错误的提示，通常是因为一些资源需要手动去确认删除，例如S3、DynamoDB、Apigateway 中有绑定自定义域名等，去到相关的服务页面将其删除后再返回执行删除操作即可.
  
- **AWS cloud 在不同区域相对于大陆的网速情况测试参考**：[cloudping](https://www.cloudping.info/)  
  
    ```javascript
      us-east-1 美国东部 (弗吉尼亚北部)
          * ping 平均在800ms
          * https://wetodos.api.anxing131.xyz/dev/public
      us-east-2 美国东部 (俄亥俄)
      us-west-2 美国西部 (俄勒冈)
          * ping 平均在400ms
          * https://5d4xhyyx1a.execute-api.us-west-2.amazonaws.com/dev/public
      eu-west-1 欧洲 (爱尔兰)
      eu-west-2 欧洲 (伦敦) 
      ap-northeast-1 亚太地区 (东京) 
          * ping 平均在200ms， 
          * https://smz0fxerl6.execute-api.ap-northeast-1.amazonaws.com/dev/public
      ap-southeast-1 亚太地区 (新加坡) 
          * ping平均在800 ms
          * https://yjc1zeussl.execute-api.ap-southeast-1.amazonaws.com/dev/public
      ap-southeast-2 亚太地区 (悉尼)
      eu-central-1 欧洲 (法兰克福)
    ```
    
- **Test Case 中的apollo-client query 操作是默认查询在缓存中的，要设置不从缓存中查询**
  
  ```javascript
      const authClient = new ApolloClient({
          link: createHttpLink({ uri: 'http://localhost:3000/auth', fetch}),
          cache: new InMemoryCache(),
          defaultOptions: {
              query: {
                  fetchPolicy: 'no-cache',
                  errorPolicy: 'all',
              }
          }
      });
  ```
