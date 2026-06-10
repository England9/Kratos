import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Fitness } from "./components/Fitness";
import { Layout } from "./components/Layout";
import { Nutrition } from "./components/Nutrition";
import { RewardModal } from "./components/RewardModal";
import { AppProvider } from "./context/AppContext";
import type { TabId } from "./types/app";

function CurrentTab({ activeTab }: { activeTab: TabId }) {
  if (activeTab === "nutrition") {
    return <Nutrition />;
  }

  if (activeTab === "fitness") {
    return <Fitness />;
  }

  return <Dashboard />;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <AppProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <CurrentTab activeTab={activeTab} />
      </Layout>
      <RewardModal />
    </AppProvider>
  );
}
