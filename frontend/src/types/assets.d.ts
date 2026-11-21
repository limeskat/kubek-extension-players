/** Text-imported assets are inlined by Bun.build; see frontend/src/index.ts. */
declare module "*.css" {
  const content: string;
  export default content;
}
