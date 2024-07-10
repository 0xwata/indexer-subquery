import {
    EthereumProject,
    EthereumDatasourceKind,
    EthereumHandlerKind,
  } from "@subql/types-ethereum";
  
  import * as dotenv from "dotenv";
  import path from "path";
  
  const mode = process.env.NODE_ENV || "production";
  
  // Load the appropriate .env file
  const dotenvPath = path.resolve(
    process.cwd(),
    `.env${mode !== "production" ? `.${mode}` : ""}`
  );
  dotenv.config({ path: dotenvPath });
  
  // Can expand the Datasource processor types via the generic param
  const project: EthereumProject = {
    specVersion: "1.0.0",
    version: "0.0.1",
    name: "onigiri-indexer",
    description:
      "This project can be use as a starting point for developing your new ONIGIRI SubQuery project",
    runner: {
      node: {
        name: "@subql/node-ethereum",
        version: ">=3.0.0",
      },
      query: {
        name: "@subql/query",
        version: "*",
      },
    },
    schema: {
      file: "./schema.graphql",
    },
    network: {
      /**
       * chainId is the EVM Chain ID, for ONIGIRI Testnet this is 5039
       * https://chainlist.org/chain/5039
       */
      chainId: "5039",
      /**
       * These endpoint(s) should be public non-pruned archive node
       * We recommend providing more than one endpoint for improved reliability, performance, and uptime
       * Public nodes may be rate limited, which can affect indexing speed
       * When developing your project we suggest getting a private API key
       * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
       * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
       */
      endpoint: "https://subnets.avax.network/onigiri/testnet/rpc",
    },
    dataSources: [
      {
        kind: EthereumDatasourceKind.Runtime,
        startBlock: 4165,
        options: {
          abi: "NOREN",
          address: "0xeEca3Ac0E1D340B4F6220e4E5811Bd969d548598",
        },
        assets: new Map([["NOREN", { file: "./abis/NOREN.json" }]]),
        mapping: {
          file: "./dist/index.js",
          handlers: [
            {
              handler: "handleTransferSingleNORENLog",
              kind: EthereumHandlerKind.Event,
              filter: {
                topics: [
                  "TransferSingle(address,address,address,uint256,uint256)",
                ],
              },
            },
            {
              handler: "handleNorenHolder",
              kind: EthereumHandlerKind.Event,
              filter: {
                topics: [
                  "TransferSingle(address,address,address,uint256,uint256)",
               ],
              },
            },
          ],
        },
      },
    ],
    repository: "https://github.com/subquery/ethereum-subql-starter",
  };
  
  // Must set default to the project instance
  export default project;
  