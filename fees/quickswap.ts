import { Chain } from "@defillama/sdk/build/general";
import { BreakdownAdapter, BaseAdapter } from "../adapters/types";
import { CHAIN } from "../helpers/chains";
import customBackfill from "../helpers/customBackfill";

import {
  getGraphDimensions
} from "../helpers/getUniSubgraph"

const v2Endpoints = {
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06",
}
const v2Graph = getGraphDimensions({
  graphUrls: v2Endpoints,
  feesPercent: {
    type: "volume",
    UserFees: 0.3,
    ProtocolRevenue: 0,
    SupplySideRevenue: 0.3,
    HoldersRevenue: 0,
    Revenue: 0,
    Fees: 0.3
  }
});

const v3Endpoints = {
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap-v3",
  // [CHAIN.DOGECHAIN]: "https://graph-node.dogechain.dog/subgraphs/name/quickswap/dogechain-info",
  [CHAIN.POLYGON_ZKEVM]:"https://api.studio.thegraph.com/query/44554/quickswap-v3-02/0.0.7"
}

type TStartTime = {
  [s: string | Chain]: number;
}

const startTimeV3: TStartTime = {
  [CHAIN.POLYGON]: 1662425243,
  [CHAIN.POLYGON_ZKEVM]: 1679875200,
  [CHAIN.DOGECHAIN]: 1660694400,
}

const v3Graphs = getGraphDimensions({
  graphUrls: v3Endpoints,
  totalVolume: {
    factory: "factories",
    field: "totalVolumeUSD",
  },
  dailyVolume: {
    factory: "algebraDayData",
    field: "volumeUSD",
    dateField: "date"
  },
  dailyFees: {
    factory: "algebraDayData",
    field: "feesUSD",
  },
  feesPercent: {
    type: "fees",
    ProtocolRevenue: 0,
    HoldersRevenue: 0,
    Fees: 0,
    UserFees: 100, // User fees are 100% of collected fees
    SupplySideRevenue: 100, // 100% of fees are going to LPs
    Revenue: 0 // Revenue is 100% of collected fees
  }
});

const methodology = {
  UserFees: "User pays 0.3% fees on each swap.",
  Fees: "A 0.3% of each swap is collected as trading fees",
  Revenue: "Protocol have no revenue",
  ProtocolRevenue: "Protocol have no revenue.",
  SupplySideRevenue: "All user fees are distributed among LPs.",
  HoldersRevenue: "Holders have no revenue."
}

const adapter: BreakdownAdapter = {
  breakdown: {
    v2: {
      [CHAIN.POLYGON]: {
        fetch: v2Graph(CHAIN.POLYGON),
        start: 1602118043,
        meta: {
          methodology
        },
      },
    },
    v3: Object.keys(v3Endpoints).reduce((acc, chain) => {
      acc[chain] = {
        fetch: v3Graphs(chain as Chain),
        start: startTimeV3[chain],
        meta: {
          methodology
        }
      }
      return acc
    }, {} as BaseAdapter)
  }
}

export default adapter;
