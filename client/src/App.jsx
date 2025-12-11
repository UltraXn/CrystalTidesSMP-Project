import { BrowserRouter, Routes, Route } from "react-router-dom"

import Navbar from "@/components/Navbar"
import SocialSidebar from "@/components/SocialSidebar"
import ScrollToHash from "@/components/ScrollToHash"

import Home from "@/pages/Home"
import Blog from "@/pages/Blog"
import Rules from "@/pages/Rules"
import Donors from "@/pages/Donors"
import Contests from "@/pages/Contests"
import Suggestions from "@/pages/Suggestions"
import Account from "@/pages/Account"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import NotFound from "@/pages/NotFound"

import Stories from "@/pages/Stories"

import Footer from "@/components/Footer"

import "@/styles.css"

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Navbar />
      <SocialSidebar />

      <Routes>
        <Route path="/" element={
          <main>
            <div id="home">
              <Home />
            </div>
            <div id="rules">
              <Rules />
            </div>
            <div id="donors">
              <Donors />
            </div>
            <div id="contests">
              <Contests />
            </div>
            <div id="news">
              <Blog />
            </div>
            <div id="stories">
              <Stories />
            </div>
            <div id="suggestions">
              <Suggestions />
            </div>
          </main>
        } />

        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  )
}
