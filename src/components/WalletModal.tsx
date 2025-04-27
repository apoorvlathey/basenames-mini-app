import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  VStack,
  Text,
  HStack,
  Link,
  Icon,
} from "@chakra-ui/react";
import { useAccount, useDisconnect, useChainId } from "wagmi";
import { base } from "wagmi/chains";
import { ExternalLinkIcon } from "@chakra-ui/icons";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const isMainnet = chainId === base.id;
  const explorerBaseUrl = isMainnet
    ? "https://basescan.org"
    : "https://sepolia.basescan.org";

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
      <ModalContent
        mx={4}
        rounded="2xl"
        bg="brand.primary"
        borderColor="whiteAlpha.200"
        borderWidth="1px"
        boxShadow="xl"
      >
        <ModalHeader
          fontSize="lg"
          fontWeight="semibold"
          textAlign="center"
          color="white"
        >
          Wallet
        </ModalHeader>
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="whiteAlpha.700" textAlign="left">
              Connected Address
            </Text>
            <Link
              href={`${explorerBaseUrl}/address/${address}`}
              isExternal
              _hover={{ textDecoration: "none" }}
              display="block"
            >
              <HStack
                spacing={2}
                bg="whiteAlpha.100"
                rounded="xl"
                px={4}
                py={3}
                _hover={{ bg: "whiteAlpha.200" }}
                transition="all 0.2s"
              >
                <Text
                  fontSize="md"
                  fontWeight="medium"
                  color="white"
                  wordBreak="break-all"
                  flex="1"
                >
                  {address}
                </Text>
                <Icon
                  as={ExternalLinkIcon}
                  w={4}
                  h={4}
                  color="whiteAlpha.800"
                  _groupHover={{ color: "white" }}
                />
              </HStack>
            </Link>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              size="lg"
              rounded="xl"
              color="white"
              borderColor="whiteAlpha.400"
              _hover={{ bg: "whiteAlpha.100" }}
              _active={{ bg: "whiteAlpha.200" }}
            >
              Disconnect
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
