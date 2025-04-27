"use client";

import { Button, useDisclosure } from "@chakra-ui/react";
import { useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { NetworkSwitchModal } from "./NetworkSwitchModal";

export function NetworkIndicator() {
  const chainId = useChainId();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isMainnet = chainId === base.id;

  if (isMainnet) {
    return null;
  }

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
        Base Sepolia
      </Button>

      <NetworkSwitchModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
