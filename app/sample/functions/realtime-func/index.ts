import * as AWS from 'aws-sdk';
import { DynamoDBStreamHandler } from 'aws-lambda';
import { table } from 'console';

const hostname = process.env.HOSTNAME || '';

const dynamoOpt = {
    endpoint: `http://${hostname}:4566`
};
const db = new AWS.DynamoDB.DocumentClient(dynamoOpt);
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

interface UpdatedResponse {
    issend: number
}

export const handler: DynamoDBStreamHandler = (event, context) => {
    event.Records.forEach(record => {
        // TODO Complex Processing
        console.log(record.eventName);
        console.log(JSON.stringify(record, null, 2));

        if (record.eventName === 'INSERT') {
            const newImage = record.dynamodb?.NewImage;

            if (newImage) {
                const no = newImage['No']['N'];

                db.update({
                    TableName: TABLE_NAME,
                    Key: {
                        'No': Number(no)
                    },
                    UpdateExpression: 'set issend=:val',
                    ExpressionAttributeValues: {
                        ':val': 1
                    },
                    ReturnValues: 'UPDATED_OLD'
                }, (err, data) => {
                    console.log(data);

                    const resp = data.Attributes as UpdatedResponse;

                    if (resp.issend === 0) {
                        const from = newImage['from']['S'];
                        const to = newImage['to']['S'];
                        const sub = newImage['sub']['S'];
                        const text = newImage['text']['S'];

                        console.log(`from: ${from}`);
                        console.log(`to: ${to}`);
                        console.log(`sub: ${sub}`);
                        console.log(`text: ${text}`);
                    }
                });
            }
        } else if (record.eventName === 'MODIFY') {
            console.log(`why MODIFY ?`);
        }
    });
};
