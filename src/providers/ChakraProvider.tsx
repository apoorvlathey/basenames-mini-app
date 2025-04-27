"use client";

import { ChakraProvider as Provider, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        maxWidth: "100vw",
        overflow: "hidden",
        height: "100vh",
        fontFamily: "inherit",
      },
    },
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      primary: "#2563EB",
      hover: "#1D4ED8",
      active: "#1E40AF",
    },
  },
  fonts: {
    heading: "inherit",
    body: "inherit",
  },
  components: {
    Input: {
      defaultProps: {
        focusBorderColor: "brand.primary",
      },
    },
    Button: {
      baseStyle: {
        fontWeight: "600",
      },
      variants: {
        brand: {
          bg: "brand.primary",
          color: "white",
          _hover: { bg: "brand.hover" },
          _active: { bg: "brand.active" },
          _disabled: {
            opacity: 0.6,
            cursor: "not-allowed",
            _hover: { bg: "brand.primary" },
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          mx: 4,
        },
      },
    },
    Badge: {
      baseStyle: {
        fontWeight: "600",
      },
    },
  },
});

export function ChakraProvider({ children }: { children: React.ReactNode }) {
  return <Provider theme={theme}>{children}</Provider>;
}
