import React from "react";
import Hero from "../components/Heros";
import ProfileProgressSection from "../components/ProfileProgressSection";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import Ourtargets from "../components/Ourtargets";

function Home() {
  return (
    <div>
      <Hero />
      <ProfileProgressSection />
      <Ourtargets />
      <Pricing />
      <Testimonials />
    </div>
  );
}

export default Home;
