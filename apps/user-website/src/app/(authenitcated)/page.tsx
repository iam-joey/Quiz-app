"use client";

import { useActiveUsers } from "@/src/components/context/ActiveUserContext";
import Dashboard from "@/src/components/DashBoard/DashBoard";

const Home = () => {
  const activeUsers: ReturnType<typeof useActiveUsers> = useActiveUsers();

  if (!activeUsers) {
    return <div>Loading...</div>;
  }

  return <Dashboard users={activeUsers} />;
};

export default Home;
