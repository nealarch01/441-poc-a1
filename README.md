Created with TypeScript and Node.js

A demo program that connects to a PostgreSQL database and fetches data using GraphQL. To achieve this, [PostGraphile](https://www.graphile.org/postgraphile/) was used an intermediary.

## Installation Steps
1. Clone the repository
2. Install dependencies by typing ```npm install``` in the cloned directory


## To initialize the database:
1. Create a PostgreSQL server instance running at port 2001
2. Create a database named "sample"
3. Run ```npm run init-db```

## To run the GraphiQL
1. Type ```npm run postgraphile```
2. Go into your browser and access the URL "localhost:5000/graphiql"

## To run the program
Simply type ```npm start```

## Resources used:
- https://www.graphile.org/postgraphile/usage-schema/
- https://github.com/graphile/cookbook/blob/master/examples/schema_only/QueryRunner.js
- https://www.graphile.org/graphile-build-pg/settings/#gatsby-focus-wrapper
- https://graphql.org/learn/

<p align="center">
<img src="https://64.media.tumblr.com/9770571ab05127b199173f96b992db9b/tumblr_pr7sx4NdpL1xp1nxxo1_640.jpg" height="250">
</p>

