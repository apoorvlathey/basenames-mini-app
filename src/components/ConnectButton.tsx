"use client";

import { Button, useDisclosure, HStack, Avatar, Text } from "@chakra-ui/react";
import { useAccount, useConnect } from "wagmi";
import { WalletModal } from "./WalletModal";
import { useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [farcasterUser, setFarcasterUser] = useState<{
    username: string;
    pfp: string;
  } | null>(null);

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        const context = await sdk.context;
        if (context?.user?.fid) {
          setFarcasterUser({
            username: context.user.username || "",
            pfp: context.user.pfpUrl || "",
          });
        }
      } catch (error) {
        console.error("Error getting Farcaster user:", error);
      }
    };

    if (isConnected) {
      initFarcaster();
    }
  }, [isConnected]);

  if (isConnected) {
    return (
      <>
        <Button
          variant="brand"
          bg="brand.hover"
          size="lg"
          onClick={onOpen}
          rounded="xl"
          px={4}
          py={2}
        >
          <HStack spacing={2}>
            {farcasterUser && (
              <>
                <Avatar size="xs" src={farcasterUser.pfp} />
                <Text>{farcasterUser.username}</Text>
              </>
            )}
            {!farcasterUser && (
              <Text>{`${address?.slice(0, 6)}...${address?.slice(-4)}`}</Text>
            )}
          </HStack>
        </Button>

        <WalletModal isOpen={isOpen} onClose={onClose} />
      </>
    );
  }

  return (
    <Button
      variant="brand"
      size="lg"
      onClick={() => connect({ connector: connectors[0] })}
      rounded="xl"
      px={6}
      py={2}
    >
      Connect Wallet
    </Button>
  );
}
