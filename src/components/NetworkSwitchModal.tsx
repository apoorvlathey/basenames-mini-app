import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";

interface NetworkSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NetworkSwitchModal({
  isOpen,
  onClose,
}: NetworkSwitchModalProps) {
  const { switchChain } = useSwitchChain();

  const handleSwitchToMainnet = () => {
    switchChain({ chainId: base.id });
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
          Switch Network
        </ModalHeader>
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="whiteAlpha.700" textAlign="center">
              You are currently on Base Sepolia (testnet).
            </Text>
            <Button
              variant="outline"
              onClick={handleSwitchToMainnet}
              size="lg"
              rounded="xl"
              color="white"
              borderColor="whiteAlpha.400"
              _hover={{ bg: "whiteAlpha.100" }}
              _active={{ bg: "whiteAlpha.200" }}
            >
              Switch to Base Mainnet
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
