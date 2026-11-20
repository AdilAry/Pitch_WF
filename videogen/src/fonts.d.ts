// Font files imported from src/fonts resolve to a URL.
declare module "*.woff2" {
  const url: string;
  export default url;
}
