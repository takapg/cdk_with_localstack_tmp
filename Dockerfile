FROM node:14-alpine
WORKDIR /app/sample
RUN npm install -g aws-cdk aws-cdk-local
RUN npm install
CMD ["sh"]
