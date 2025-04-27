"use client";

import { HStack, Button } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <HStack spacing={4} width="full" justifyContent="center">
      <Button
        variant={pathname === "/" ? "solid" : "ghost"}
        colorScheme="whiteAlpha"
        color="white"
        size="lg"
        fontWeight="medium"
        onClick={() => router.push("/")}
        _hover={{ bg: "whiteAlpha.200" }}
        _active={{ bg: "whiteAlpha.300" }}
      >
        Register
      </Button>
      <Button
        variant={pathname === "/resolve" ? "solid" : "ghost"}
        colorScheme="whiteAlpha"
        color="white"
        size="lg"
        fontWeight="medium"
        onClick={() => router.push("/resolve")}
        _hover={{ bg: "whiteAlpha.200" }}
        _active={{ bg: "whiteAlpha.300" }}
      >
        Resolve
      </Button>
    </HStack>
  );
}
