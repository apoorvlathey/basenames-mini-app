import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import {
  BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_MAINNET,
  BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_TESTNET,
  REGISTRAR_ABI,
} from "@/config/contracts";

// Create clients for Base networks
export const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const baseSepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export const checkBasenameAvailability = async (
  basename: string,
  isMainnet: boolean = true
) => {
  try {
    // Remove .base.eth or .basetest.eth suffix if present
    const suffix = isMainnet ? ".base.eth" : ".basetest.eth";
    const cleanBasename = basename.endsWith(suffix)
      ? basename.slice(0, -suffix.length)
      : basename;

    const client = isMainnet ? baseClient : baseSepoliaClient;
    const registrarAddress = isMainnet
      ? BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_MAINNET
      : BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_TESTNET;

    const isAvailable = await client.readContract({
      address: registrarAddress,
      abi: REGISTRAR_ABI,
      functionName: "available",
      args: [cleanBasename],
    });

    return {
      isAvailable,
      basename: cleanBasename + suffix,
      error: null,
    };
  } catch (error) {
    console.error("Availability check error:", error);

    return {
      isAvailable: false,
      basename,
      error:
        error instanceof Error
          ? `Failed to check availability: ${error.message}`
          : "Failed to check basename availability",
    };
  }
};
