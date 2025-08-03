#!/usr/bin/env node

const fetch = require('node-fetch');

const SUBGRAPH_URL =
  'https://api.studio.thegraph.com/query/117682/first/v0.0.7';
const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer 8bc64f5ab2554c33e35df2b552b79818',
};

async function getCurrentNetworkBlock() {
  const response = await fetch('https://node.ghostnet.etherlink.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'eth_blockNumber',
      params: [],
      id: 1,
      jsonrpc: '2.0',
    }),
  });
  const data = await response.json();
  return parseInt(data.result, 16);
}

async function getSubgraphBlock() {
  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      query: '{ _meta { block { number } } }',
    }),
  });
  const data = await response.json();
  return data.data._meta.block.number;
}

async function getQuestCount() {
  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      query: '{ quests { questId } }',
    }),
  });
  const data = await response.json();
  return data.data.quests.length;
}

async function monitorSync() {
  try {
    const [networkBlock, subgraphBlock, questCount] = await Promise.all([
      getCurrentNetworkBlock(),
      getSubgraphBlock(),
      getQuestCount(),
    ]);

    const blocksLag = networkBlock - subgraphBlock;
    const timeLag = blocksLag * 2; // Assuming 2s block time

    console.log(`
🔍 Subgraph Sync Status (v0.0.7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Network Block:    ${networkBlock.toLocaleString()}
📈 Subgraph Block:   ${subgraphBlock.toLocaleString()}
⚡ Blocks Behind:    ${blocksLag.toLocaleString()}
⏱️  Time Lag:        ${timeLag}s (~${Math.round(timeLag / 60)}m)
🎯 Total Quests:     ${questCount}

${blocksLag <= 50 ? '✅ GOOD SYNC' : blocksLag <= 200 ? '⚠️  SLOW SYNC' : '🔴 VERY SLOW'}
`);
  } catch (error) {
    console.error('❌ Monitor error:', error.message);
  }
}

monitorSync();
