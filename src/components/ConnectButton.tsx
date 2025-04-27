"use client";

import { Button, useDisclosure } from "@chakra-ui/react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { WalletModal } from "./WalletModal";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
          {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
        </Button>

        <WalletModal isOpen={isOpen} onClose={onClose} />
      </>
    );
  }

  return (
    <Button
      variant="brand"
      size="lg"
      onClick={() => connect({ connector: injected() })}
      rounded="xl"
      px={6}
      py={2}
    >
      Connect Wallet
    </Button>
  );
}
