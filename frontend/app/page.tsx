"use client";

import React from "react";
import Card from "@/components/Card";
import List from "@/components/List";

const Home: React.FC = () => {
  return (
    <>
      <Card className="mb-2">
        <h1 className="text-2xl font-semibold">Little Lions Impact</h1>
        <List
          items={[
            { label: "Townships", value: "6" },
            { label: "Workshops", value: "1300" },
            { label: "Children", value: "2000" },
          ]}
        />
      </Card>
    </>
  );
};

export default Home;
