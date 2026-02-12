import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import CustomBulkBanner from '../components/CustomBulkBanner'
import OurPolicy from '../components/OurPolicy'
import Testimonials from '../components/Testimonials'

const Home = () => {
  return (
    <main>
      <Hero />
      <LatestCollection />
      <BestSeller />
      <CustomBulkBanner />
      <OurPolicy />
      <Testimonials />
    </main>
  );
};

export default Home
