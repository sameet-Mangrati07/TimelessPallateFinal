import React from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/users/navbar/page";
import Index from "./routes/users/index/page";
import Lenis from "lenis";
import Contact from "./routes/users/contact/page";
import Login from "./routes/users/login/page";
import Shop from "./routes/users/shop/page";
import About from "./routes/users/about/page";

export default function App() {
  const lenis = new Lenis();

  // Use requestAnimationFrame to continuously update the scroll
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
  return (
    <React.Fragment>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </React.Fragment>
  );
}
