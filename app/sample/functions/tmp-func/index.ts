import * as AWS from 'aws-sdk';

// console.log(process.env.DYNAMODB_ENDPOINT);

const endpoint = process.env.DYNAMODB_ENDPOINT || '';

const dynamoOpt = {
    endpoint: `http://${endpoint}:4566`
  };
const db = new AWS.DynamoDB.DocumentClient(dynamoOpt);
const TABLE_NAME = process.env.TABLE_NAME || "";
const PRIMARY_KEY = process.env.PRIMARY_KEY || "";

export const handler = async (event: any = {}): Promise<any> => {
  const requestedItemId = event.pathParameters.id;
    if (!requestedItemId) {
      return {
        statusCode: 400,
        body: `Error: You are missing the path parameter id`,
      };
    }

  const params = {
    TableName: TABLE_NAME,
      Key: {
        [PRIMARY_KEY]: requestedItemId,
      },
    };

  try {
    const response = await db.get(params).promise();
      return { statusCode: 200, body: JSON.stringify(response.Item) };
    } catch (dbError) {
      return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
