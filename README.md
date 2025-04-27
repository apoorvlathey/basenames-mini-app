# Basename Mini-App

A mobile-first mini-app for registering and setting basenames for Farcaster wallets on Base network.

## Features

- Register basenames on Base Mainnet and Base Sepolia
- Mobile-first design
- Dark mode by default
- Wallet integration with wagmi

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Start the development server:

```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Connect your wallet (Base Mainnet or Base Sepolia)
2. Enter your desired basename
3. Click "Register Basename" to register your basename
4. Confirm the transaction in your wallet

## Technical Details

- Built with Next.js 14 and TypeScript
- Uses Chakra UI for styling
- Integrates with wagmi for wallet connections
- Uses viem for Ethereum interactions

## Networks Supported

- Base Mainnet (Chain ID: 8453)
- Base Sepolia (Chain ID: 84532)

## License

MIT
