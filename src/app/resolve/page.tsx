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
  Card,
  CardBody,
  Select,
  InputGroup,
  InputRightAddon,
  Skeleton,
} from "@chakra-ui/react";
import { Navigation } from "@/components/Navigation";
import { resolveBasename } from "@/lib/resolver";

type Network = "mainnet" | "testnet";

export default function ResolvePage() {
  const [basename, setBasename] = useState("");
  const [network, setNetwork] = useState<Network>("mainnet");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    address: string | null;
    basename: string;
    error: string | null;
  } | null>(null);
  const toast = useToast();
  const justPasted = useRef(false);

  const suffix = network === "mainnet" ? ".base.eth" : ".basetest.eth";

  // Handle input changes and auto-detect network
  const handleBasenameChange = (value: string) => {
    if (value.endsWith(".base.eth")) {
      setNetwork("mainnet");
      setBasename(value.replace(".base.eth", ""));
    } else if (value.endsWith(".basetest.eth")) {
      setNetwork("testnet");
      setBasename(value.replace(".basetest.eth", ""));
    } else {
      setBasename(value);
    }
  };

  const handleResolve = async () => {
    if (!basename || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      const resolution = await resolveBasename(basename, network === "mainnet");
      setResult(resolution);

      if (resolution.error) {
        toast({
          title: "Error",
          description: resolution.error,
          status: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to resolve basename",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleResolve();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Prevent the default paste behavior
    e.preventDefault();

    const pastedText = e.clipboardData.getData("text").trim();

    // Handle the paste manually
    if (pastedText.endsWith(".base.eth")) {
      setNetwork("mainnet");
      setBasename(pastedText.replace(".base.eth", ""));
    } else if (pastedText.endsWith(".basetest.eth")) {
      setNetwork("testnet");
      setBasename(pastedText.replace(".basetest.eth", ""));
    } else {
      setBasename(pastedText);
    }

    // Set the paste flag
    justPasted.current = true;
  };

  // Effect to handle resolution after paste
  useEffect(() => {
    if (justPasted.current && basename) {
      handleResolve();
      justPasted.current = false;
    }
  }, [basename, network]);

  return (
    <Container maxW="container.sm" py={8}>
      <VStack spacing={6}>
        <Navigation />

        <Text fontSize="2xl" fontWeight="bold">
          Resolve Basename
        </Text>

        <FormControl>
          <FormLabel>Basename</FormLabel>
          <HStack spacing={4} width="full" align="flex-start">
            <InputGroup>
              <Input
                placeholder="Enter basename"
                value={basename}
                onChange={(e) => handleBasenameChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
              />
              <InputRightAddon padding={0} overflow="hidden">
                <Select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value as Network)}
                  borderRadius="0"
                  borderWidth="0"
                >
                  <option value="mainnet">.base.eth</option>
                  <option value="testnet">.basetest.eth</option>
                </Select>
              </InputRightAddon>
            </InputGroup>
          </HStack>
        </FormControl>

        <Button
          colorScheme="blue"
          width="full"
          onClick={handleResolve}
          isDisabled={!basename || isLoading}
          isLoading={isLoading}
          loadingText="Resolving..."
        >
          Resolve Basename
        </Button>

        {isLoading ? (
          <Card width="full">
            <CardBody>
              <VStack align="start" spacing={2} width="full">
                <Skeleton height="24px" width="80%" />
                <Skeleton height="24px" width="100%" />
              </VStack>
            </CardBody>
          </Card>
        ) : (
          result &&
          !result.error && (
            <Card width="full">
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Text>
                    <strong>Basename:</strong> {result.basename}
                  </Text>
                  <Text>
                    <strong>Address:</strong> {result.address}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          )
        )}
      </VStack>
    </Container>
  );
}
