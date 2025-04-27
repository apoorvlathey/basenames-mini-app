"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Image,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  Link,
  Icon,
} from "@chakra-ui/react";
import confetti from "canvas-confetti";
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
import { sdk } from "@/lib/farcaster";

const GitHubIcon = () => (
  <Icon viewBox="0 0 24 24" boxSize={6} color="whiteAlpha.900">
    <path
      fill="currentColor"
      d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
    />
  </Icon>
);

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
  const [farcasterUsername, setFarcasterUsername] = useState<string | null>(
    null
  );
  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();

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
    let value = e.target.value.trim();

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

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        const context = await sdk.context;
        if (context?.user?.username) {
          setFarcasterUsername(context.user.username);
          // Check if username.base.eth is available
          const result = await checkBasenameAvailability(
            context.user.username,
            isMainnet
          );
          if (result.isAvailable) {
            setBasename(context.user.username);
          }
          setAvailability({
            isAvailable: result.isAvailable,
            error: result.error,
          });
        }
      } catch (error) {
        console.error("Error getting Farcaster user:", error);
      }

      // Always call ready() to hide the splash screen, regardless of Farcaster user status
      try {
        await sdk.actions.ready();
      } catch (error) {
        console.error("Error calling ready:", error);
      }
    };

    if (isConnected) {
      initFarcaster();
    }
  }, [isConnected, isMainnet]);

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

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      onSuccessOpen();
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

  const handleShare = async () => {
    if (farcasterUsername) {
      try {
        await sdk.actions.composeCast({
          text: `I registered ${basename}${suffix} for my Warplet! 🎉\n\nClaim your own here: https://basenames.apoorv.xyz`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  // Test function to simulate success
  const handleTestSuccess = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    onSuccessOpen();
  };

  const handleClearBasename = () => {
    setBasename("");
    setAvailability(null);
  };

  const handleProfileClick = useCallback(async () => {
    try {
      if (farcasterUsername) {
        // If in Farcaster mini-app
        await sdk.actions.viewProfile({
          fid: 14241,
        });
      } else {
        // If not in Farcaster mini-app, open Warpcast profile in new tab
        window.open("https://warpcast.com/apoorvlathey", "_blank");
      }
    } catch (error) {
      console.error("Error handling profile click:", error);
    }
  }, [farcasterUsername]);

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
              mt={8}
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
              Register Basename for your Warplet
            </Text>
          </VStack>

          <Box
            mt={8}
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
                <HStack justify="space-between" align="center" mb={2}>
                  <FormLabel
                    fontSize="md"
                    color="gray.700"
                    fontWeight="medium"
                    mb={0}
                  >
                    Search for a name
                  </FormLabel>
                  {basename && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={handleClearBasename}
                      color="gray.500"
                      _hover={{ color: "gray.700" }}
                      aria-label="Clear input"
                    >
                      clear
                    </Button>
                  )}
                </HStack>
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
                  <>
                    {availability.error ? (
                      <Text
                        color="red.500"
                        mt={2}
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        {availability.error}
                      </Text>
                    ) : (
                      <>
                        {!availability.isAvailable &&
                          farcasterUsername === basename && (
                            <Text
                              color="blue.500"
                              mt={2}
                              fontSize="sm"
                              fontWeight="medium"
                            >
                              Note: {basename}
                              {suffix} is already taken
                            </Text>
                          )}
                        {!availability.isAvailable &&
                          farcasterUsername !== basename && (
                            <Text
                              color="red.500"
                              mt={2}
                              fontSize="sm"
                              fontWeight="medium"
                            >
                              ✗ Basename is not available
                            </Text>
                          )}
                        {availability.isAvailable && (
                          <Text
                            color="green.500"
                            mt={2}
                            fontSize="sm"
                            fontWeight="medium"
                          >
                            ✓ Basename is available!
                          </Text>
                        )}
                      </>
                    )}
                  </>
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

        {/* Footer */}
        <Box
          as="footer"
          mt={8}
          textAlign="center"
          cursor="pointer"
          onClick={handleProfileClick}
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.2s"
        >
          <HStack
            spacing={2}
            justify="center"
            color="whiteAlpha.900"
            fontSize="sm"
          >
            <Text>by</Text>
            <Image
              src="/apoorvlathey.avif"
              alt="Apoorv Lathey"
              width={5}
              height={5}
              rounded="full"
            />
            <Text>@apoorvlathey</Text>
          </HStack>
        </Box>
      </Container>

      {/* Add test button in development */}
      {/* {process.env.NODE_ENV === "development" && (
        <Button
          position="fixed"
          bottom={4}
          right={4}
          onClick={handleTestSuccess}
          colorScheme="purple"
          zIndex={100}
        >
          Test Success
        </Button>
      )} */}
      <Link
        position="fixed"
        bottom={4}
        right={4}
        zIndex={100}
        href="https://github.com/apoorvlathey/basenames-mini-app"
        isExternal
      >
        <GitHubIcon />
      </Link>

      {/* Success Drawer */}
      <Drawer
        isOpen={isSuccessOpen}
        placement="bottom"
        onClose={onSuccessClose}
      >
        <DrawerOverlay />
        <DrawerContent
          borderTopRadius="2xl"
          bg="white"
          pb="env(safe-area-inset-bottom)"
        >
          <DrawerBody py={6}>
            <VStack spacing={4}>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="gray.800"
                textAlign="center"
              >
                🎉 Successfully registered {basename}
                {suffix}!
              </Text>
              {farcasterUsername && (
                <Button
                  colorScheme="purple"
                  width="full"
                  onClick={handleShare}
                  size="lg"
                  rounded="xl"
                >
                  Share with Followers
                </Button>
              )}
              <Button
                variant="ghost"
                width="full"
                onClick={onSuccessClose}
                size="lg"
                rounded="xl"
              >
                Close
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
