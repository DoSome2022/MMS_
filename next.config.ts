// next.config.js
const nextConfig = {
  // 完全關閉 Turbopack 快取（開發階段超有用）
  onDemandEntries: {
    maxInactiveAge: 1, // 1ms 後就丟棄
  },
};
export default nextConfig;