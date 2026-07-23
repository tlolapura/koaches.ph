import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).hostname : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async redirects() {
    return [
      { source: "/coach/calendar", destination: "/coach/sessions", permanent: true },
      { source: "/coach/promos", destination: "/coach/dashboard", permanent: true },
      { source: "/coach/certificates", destination: "/coach/dashboard", permanent: true },
      { source: "/coach/free-trial", destination: "/coach/dashboard", permanent: true },
      { source: "/admin/announcements", destination: "/admin/coaches", permanent: true },
      { source: "/admin/stats", destination: "/admin/coaches", permanent: true },
      { source: "/admin/subscriptions", destination: "/admin/coaches", permanent: true },
      { source: "/certificate/:id", destination: "/coach/dashboard", permanent: true },
    ];
  },
};

export default nextConfig;
