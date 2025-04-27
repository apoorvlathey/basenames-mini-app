"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Text,
  VStack,
  useToast,
  Heading,
  InputGroup,
  InputRightAddon,
} from "@chakra-ui/react";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import { encodeFunctionData, namehash, parseEther } from "viem";
import { base } from "wagmi/chains";
import {
  BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_MAINNET,
  BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_TESTNET,
  L2_RESOLVER_ABI,
  L2_RESOLVER_ADDRESS_MAINNET,
  L2_RESOLVER_ADDRESS_TESTNET,
  REGISTRAR_ABI,
  REGISTRATION_DURATION,
} from "@/config/contracts";
import { ConnectButton } from "@/components/ConnectButton";
import { NetworkIndicator } from "@/components/NetworkIndicator";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { checkBasenameAvailability } from "@/lib/basename";

export default function Home() {
  const [basename, setBasename] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [availability, setAvailability] = useState<{
    isAvailable: boolean;
    error: string | null;
  } | null>(null);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const toast = useToast();
  const checkTimeout = useRef<NodeJS.Timeout>();

  const isMainnet = chainId === base.id;
  const suffix = isMainnet ? ".base.eth" : ".basetest.eth";
  const registrarAddress = isMainnet
    ? BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_MAINNET
    : BASENAMES_REGISTRAR_CONTROLLER_ADDRESS_TESTNET;
  const resolverAddress = isMainnet
    ? L2_RESOLVER_ADDRESS_MAINNET
    : L2_RESOLVER_ADDRESS_TESTNET;

  const { writeContractAsync } = useWriteContract();

  const handleBasenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (value.endsWith(".base.eth")) {
      value = value.replace(".base.eth", "");
    } else if (value.endsWith(".basetest.eth")) {
      value = value.replace(".basetest.eth", "");
    }

    setBasename(value);
    setAvailability(null);
  };

  useEffect(() => {
    if (basename) {
      setIsChecking(true);

      if (checkTimeout.current) {
        clearTimeout(checkTimeout.current);
      }

      checkTimeout.current = setTimeout(async () => {
        try {
          const result = await checkBasenameAvailability(basename, isMainnet);
          setAvailability({
            isAvailable: result.isAvailable,
            error: result.error,
          });
        } catch (error) {
          console.error("Error checking availability:", error);
        } finally {
          setIsChecking(false);
        }
      }, 500);
    } else {
      setIsChecking(false);
      setAvailability(null);
    }

    return () => {
      if (checkTimeout.current) {
        clearTimeout(checkTimeout.current);
      }
    };
  }, [basename, isMainnet]);

  const handleRegister = async () => {
    if (!address || !isConnected) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        status: "error",
        duration: 3000,
        position: "bottom-right",
        isClosable: true,
      });
      return;
    }

    try {
      const fullBasename = basename.endsWith(suffix)
        ? basename
        : basename + suffix;
      const nameHash = namehash(fullBasename);

      const addressData = encodeFunctionData({
        abi: L2_RESOLVER_ABI,
        functionName: "setAddr",
        args: [nameHash, address],
      });

      const nameData = encodeFunctionData({
        abi: L2_RESOLVER_ABI,
        functionName: "setName",
        args: [nameHash, fullBasename],
      });

      await writeContractAsync({
        abi: REGISTRAR_ABI,
        address: registrarAddress,
        functionName: "register",
        args: [
          {
            name: basename,
            owner: address,
            duration: REGISTRATION_DURATION,
            resolver: resolverAddress,
            data: [addressData, nameData],
            reverseRecord: true,
          },
        ],
        value: parseEther("0.002"),
      });

      toast({
        title: "Success",
        description: `Successfully registered basename ${fullBasename}`,
        status: "success",
        duration: 5000,
        position: "bottom-right",
        isClosable: true,
      });
    } catch (error) {
      // Handle viem errors with shortMessage
      const errorMessage =
        error && typeof error === "object" && "shortMessage" in error
          ? String(error.shortMessage)
          : error instanceof Error
          ? error.message
          : "Unknown error";

      toast({
        title: "Transaction Failed",
        description: errorMessage,
        status: "error",
        duration: 3000,
        position: "bottom-right",
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg="brand.primary" position="relative" overflow="hidden">
      <AnimatedBackground />

      {/* Header with wallet connection */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        backdropFilter="blur(12px)"
        zIndex={10}
      >
        <Container maxW="container.lg" py={{ base: 2, md: 3 }}>
          <HStack spacing={{ base: 2, md: 3 }} justify="flex-end">
            <Box
              transform={{ base: "scale(0.9)", md: "none" }}
              transformOrigin="right"
            >
              <ConnectButton />
            </Box>
            {!isMainnet && (
              <Box
                transform={{ base: "scale(0.9)", md: "none" }}
                transformOrigin="left"
              >
                <NetworkIndicator />
              </Box>
            )}
          </HStack>
        </Container>
      </Box>

      {/* Main content */}
      <Container
        maxW="container.lg"
        pt={{ base: 28, md: 32 }}
        pb={16}
        px={4}
        position="relative"
        zIndex={2}
      >
        <VStack spacing={{ base: 6, md: 8 }} align="center">
          <VStack spacing={{ base: 3, md: 4 }} textAlign="center">
            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "5xl" }}
              fontWeight="bold"
              color="white"
              letterSpacing="tight"
              lineHeight={{ base: "1.2", md: "1.1" }}
            >
              Basenames
            </Heading>
            <Text
              fontSize={{ base: "xl", md: "xl" }}
              color="whiteAlpha.900"
              maxW="xl"
              lineHeight={{ base: "1.5", md: "tall" }}
              px={{ base: 4, md: 0 }}
            >
              Register basename for your Warplet
            </Text>
          </VStack>

          <Box
            bg="white"
            rounded="2xl"
            shadow="xl"
            p={6}
            w="full"
            maxW="xl"
            mx="auto"
          >
            <VStack spacing={6}>
              <FormControl>
                <FormLabel fontSize="md" color="gray.700" fontWeight="medium">
                  Search for a name
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    placeholder="Enter basename"
                    value={basename}
                    onChange={handleBasenameChange}
                    bg="white"
                    color="gray.900"
                    border="2px solid"
                    borderColor="gray.200"
                    _placeholder={{ color: "gray.400" }}
                    rounded="xl"
                    fontSize="md"
                  />
                  <InputRightAddon
                    bg="gray.100"
                    color="gray.600"
                    fontSize="md"
                    roundedRight="xl"
                    border="2px solid"
                    borderLeft="0"
                    borderColor="gray.200"
                  >
                    {suffix}
                  </InputRightAddon>
                </InputGroup>
                {isChecking && (
                  <Text color="gray.500" mt={2} fontSize="sm">
                    Checking availability...
                  </Text>
                )}
                {availability && !isChecking && (
                  <Text
                    color={availability.isAvailable ? "green.500" : "red.500"}
                    mt={2}
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    {availability.error
                      ? availability.error
                      : availability.isAvailable
                      ? "✓ Basename is available!"
                      : "✗ Basename is not available"}
                  </Text>
                )}
              </FormControl>

              <Button
                variant="brand"
                size="lg"
                width="full"
                onClick={handleRegister}
                isDisabled={
                  !isConnected ||
                  !basename ||
                  (availability && !availability.isAvailable) ||
                  isChecking
                }
                rounded="xl"
                fontSize="md"
                py={6}
                _hover={{ transform: "translateY(-1px)" }}
                transition="all 0.2s"
              >
                Register
              </Button>

              {!isConnected && (
                <Text color="red.500" fontSize="sm" fontWeight="medium">
                  Please connect your wallet first
                </Text>
              )}
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
