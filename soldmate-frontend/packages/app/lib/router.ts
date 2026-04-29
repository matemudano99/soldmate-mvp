import { useRouter as useSolitoRouter } from "solito/router";

export function useRouter() {
  const router = useSolitoRouter();

  return {
    push: (href: string) => router.push(href),
    replace: (href: string) => router.replace(href),
    back: () => router.back(),
  };
}
