import { withExpo } from "@expo/next-adapter";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile packages that use React Native
  transpilePackages: [
    "app",
    "react-native",
    "react-native-web",
    "solito",
    "nativewind",
    "react-native-reanimated",
    "react-native-safe-area-context",
    "react-native-screens",
    "lucide-react-native",
    "react-native-svg",
    "@react-native/assets-registry",
  ],
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // In web builds, map native icons package to the web package.
    // This avoids pulling react-native-svg assets code that breaks Next parsing in Docker.
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "lucide-react-native": "lucide-react",
    };
    return config;
  },
};

export default withExpo(nextConfig);
