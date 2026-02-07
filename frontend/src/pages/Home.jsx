import React from 'react';
import Banner from '../components/home/Banner';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import CTA from '../components/home/CTA';
import Footer from '../components/home/Footer';

const Home = () => {
    return (
        <div className="font-outfit">
            <Banner />
            <Navbar />
            <Hero />
            <Features />
            <CTA />
            <Footer />
        </div>
    );
};

export default Home;
