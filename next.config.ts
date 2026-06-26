import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/coach/calendar", destination: "/coach/sessions", permanent: true },
      { source: "/coach/promos", destination: "/coach/more", permanent: true },
      { source: "/coach/certificates", destination: "/coach/more", permanent: true },
      { source: "/coach/free-trial", destination: "/coach/more", permanent: true },
      { source: "/admin/announcements", destination: "/admin/coaches", permanent: true },
      { source: "/admin/stats", destination: "/admin/coaches", permanent: true },
      { source: "/admin/subscriptions", destination: "/admin/coaches", permanent: true },
      { source: "/certificate/:id", destination: "/coach/more", permanent: true },
    ];
  },
};

export default nextConfig;
