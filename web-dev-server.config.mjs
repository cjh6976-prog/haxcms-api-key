export default {
  port: process.env.PORT ? Number(process.env.PORT) : 8000,
  nodeResolve: true,
  dedupe: true,
  watch: true,
}
