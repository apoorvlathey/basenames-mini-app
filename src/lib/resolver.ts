import { Address, createPublicClient, http, namehash } from "viem";
import { mainnet, sepolia, baseSepolia, base } from "viem/chains";
import { normalize } from "viem/ens";
import {
  L2_RESOLVER_ABI,
  L2_RESOLVER_ADDRESS_MAINNET,
  L2_RESOLVER_ADDRESS_TESTNET,
} from "@/config/contracts";

// Create clients for mainnet and sepolia since Base names are resolved through CCIP-read
export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const sepoliaClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const baseSepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// based on ERC-3668: CCIP Read
export const resolveBasename = async (
  basename: string,
  isMainnet: boolean = true
) => {
  try {
    const client = isMainnet ? mainnetClient : sepoliaClient;
    const suffix = isMainnet ? ".base.eth" : ".basetest.eth";

    // Ensure the basename has the correct suffix
    const fullBasename = basename.endsWith(suffix)
      ? basename
      : basename + suffix;
    const normalizedBasename = normalize(fullBasename);

    let address: Address | null = null;
    // CCIP read is failing for testnet
    if (isMainnet) {
      address = await client.getEnsAddress({
        name: normalizedBasename,
      });
    }

    if (address === null) {
      // fetch directly from L2 Resolver
      const l2ResolverClient = isMainnet ? baseClient : baseSepoliaClient;
      address = await l2ResolverClient.readContract({
        address: isMainnet
          ? L2_RESOLVER_ADDRESS_MAINNET
          : L2_RESOLVER_ADDRESS_TESTNET,
        abi: L2_RESOLVER_ABI,
        functionName: "addr",
        args: [namehash(normalizedBasename)],
      });
    }

    // Log successful resolution
    console.log(`Resolved ${fullBasename} to ${address}`);

    return {
      address,
      basename: fullBasename,
      error: null,
    };
  } catch (error) {
    // Log error details
    console.error("Resolution error:", error);

    return {
      address: null,
      basename: basename,
      error:
        error instanceof Error
          ? `Failed to resolve: ${error.message}`
          : "Failed to resolve basename",
    };
  }
};
