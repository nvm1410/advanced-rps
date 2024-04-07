<h1 align="center">Advanced RPS</h1>

<h3 align="center"> Your traditional Rock, Paper, Scissors, Spock, Lizard in Web3</h3>

<!-- TABLE OF CONTENTS -->
<details open>
  <summary>Table of Contents</summary>
  <ul>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#web-demo">Web Demo</a></li>
    <li><a href="#run-locally">Run locally</a></li>
    <li><a href="#known-issues">Known Issues</a></li>
  </ul>
</details>

## About The Project

A web3 website to play this extended version of rock paper scissors (See wikipedia article about [RPS and additional weapons](https://en.wikipedia.org/wiki/Rock%E2%80%93paper%E2%80%93scissors#Additional_weapons)).
Smart contract: [RPS.sol](https://github.com/clesaege/RPS/blob/master/RPS.sol)

## Web Demo

You can play the free web version here:

```
https://advanced-rps.vercel.app/
```

Note that you must have Metamask extension installed in your browser.
Connect to Sepolia Ethereum Testnet and deploy some Sepolia ETH to start playing.

## Run Locally

1. Get Ganache running locally. Add local Ganache network to Metamask and connect it to the local Ganache instance. Import at least 2 accounts to metamask.

2. Get dependencies:
   ```
   npm i
   ```
3. Run the app:
   ```
   npm run dev
   ```

## Known Issues

When running locally on Ganache, make sure to disable auto-mining. This will make sure block time is updated correctly.

