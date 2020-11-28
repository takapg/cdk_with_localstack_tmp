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

interface NoticeQueue {
    No: number,
    issend: number
}

export const handler: DynamoDBStreamHandler = (event, context) => {
    event.Records.forEach(async record => {
        // TODO Complex Processing
        console.log(record.eventName);
        console.log(JSON.stringify(record, null, 2));

        if (record.eventName === 'INSERT') {
            const newImage = record.dynamodb?.NewImage;
            console.log('INSERT !!!');
        } else if (record.eventName === 'MODIFY') {
            console.log('MODIFY !!!');
        }
    });
};
