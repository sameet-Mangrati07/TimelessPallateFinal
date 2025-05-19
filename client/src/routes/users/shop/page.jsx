import React, { useState, useEffect, useRef } from "react";
import { useMobile } from "../../../hooks/useMobile";
import { useScroll } from "../../../hooks/useScroll";
import { ChevronLeft, ChevronRight, Search, ShoppingBag, Filter, GridIcon, ListIcon, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

function Shop() {
  const isMobile = useMobile();
  const { scrollY } = useScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewType, setViewType] = useState("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentShopPage, setCurrentShopPage] = useState(1);
  const logoRef = useRef(null);
  const productsPerPage = 8;
  const totalPages = 5; // Header, Shop Content, Featured Collections, Artist Spotlight, Footer

  // Sample art categories
  const categories = [
    { id: "all", name: "All Artworks" },
    { id: "paintings", name: "Paintings" },
    { id: "photography", name: "Photography" },
    { id: "digital", name: "Digital Art" },
    { id: "mixed", name: "Mixed Media" },
    { id: "sculptures", name: "Sculptures" },
  ];

  // Sample art styles
  const styles = [
    { id: "abstract", name: "Abstract" },
    { id: "vintage", name: "Vintage" },
    { id: "black-white", name: "Black & White" },
    { id: "minimalist", name: "Minimalist" },
    { id: "boho", name: "Boho" },
    { id: "typography", name: "Typography" },
    { id: "watercolor", name: "Watercolor" },
    { id: "surreal", name: "Surreal" },
    { id: "retro", name: "Retro" },
  ];

  // Sample product data
  const products = [
    {
      id: 1,
      title: "Summer Landscape",
      artist: "Emma Richardson",
      category: "paintings",
      price: 350.0,
      image: "/images/surya-art-1.png",
      styles: ["abstract", "watercolor"],
    },
    {
      id: 2,
      title: "Urban Geometry",
      artist: "David Chen",
      category: "photography",
      price: 275.0,
      image: "/images/surya-art-2.png",
      styles: ["minimalist", "black-white"],
    },
    {
      id: 3,
      title: "Digital Dreams",
      artist: "Sophia Kim",
      category: "digital",
      price: 225.0,
      image: "/images/surya-art-3.png",
      styles: ["surreal", "abstract"],
    },
    {
      id: 4,
      title: "Mixed Emotions",
      artist: "Marcus Johnson",
      category: "mixed",
      price: 380.0,
      image: "/images/surya-art-4.png",
      styles: ["vintage", "retro"],
    },
    {
      id: 5,
      title: "Serene Waters",
      artist: "Emma Richardson",
      category: "paintings",
      price: 320.0,
      image: "/images/wall-1.jpeg",
      styles: ["watercolor", "minimalist"],
    },
    {
      id: 6,
      title: "Urban Decay",
      artist: "David Chen",
      category: "photography",
      price: 290.0,
      image: "/images/wall-2.jpeg",
      styles: ["black-white", "retro"],
    },
    {
      id: 7,
      title: "Digital Landscape",
      artist: "Sophia Kim",
      category: "digital",
      price: 245.0,
      image: "/images/wall-3.jpeg",
      styles: ["abstract", "surreal"],
    },
    {
      id: 8,
      title: "Textured Reality",
      artist: "Marcus Johnson",
      category: "mixed",
      price: 410.0,
      image: "/images/wall-4.jpeg",
      styles: ["boho", "typography"],
    },
    {
      id: 9,
      title: "Mountain View",
      artist: "Emma Richardson",
      category: "paintings",
      price: 365.0,
      image: "/images/wall-5.jpeg",
      styles: ["watercolor", "vintage"],
    },
    {
      id: 10,
      title: "City Streets",
      artist: "David Chen",
      category: "photography",
      price: 285.0,
      image: "/images/wall-6.jpeg",
      styles: ["black-white", "minimalist"],
    },
    {
      id: 11,
      title: "Digital Abstraction",
      artist: "Sophia Kim",
      category: "digital",
      price: 260.0,
      image: "/images/wall-7.jpeg",
      styles: ["abstract", "typography"],
    },
    {
      id: 12,
      title: "Mixed Elements",
      artist: "Marcus Johnson",
      category: "mixed",
      price: 395.0,
      image: "/images/wall-8.jpeg",
      styles: ["retro", "boho"],
    },
  ];

  // Filter products based on category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic for products
  const indexOfLastProduct = currentShopPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalShopPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentShopPage(1);
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentShopPage(1);
    setFilterOpen(false);
  };

  // Product pagination controls
  const nextShopPage = () => {
    if (currentShopPage < totalShopPages) {
      setCurrentShopPage(currentShopPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevShopPage = () => {
    if (currentShopPage > 1) {
      setCurrentShopPage(currentShopPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToShopPage = (pageNumber) => {
    setCurrentShopPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle menu open/closed
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Control logo size based on scroll position
  useEffect(() => {
    if (logoRef.current) {
      const scale = Math.max(0.8, 1 - scrollY / 1000);
      if (scrollY > 100) {
        logoRef.current.style.transform = `scale(${scale})`;
        logoRef.current.classList.add("scrolled");
      } else {
        logoRef.current.style.transform = "scale(1)";
        logoRef.current.classList.remove("scrolled");
      }
    }
  }, [scrollY]);

  // Track current page based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const page = Math.floor(scrollPosition / windowHeight) + 1;
      setCurrentPage(Math.min(page, totalPages));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalPages]);

  // Effect to handle resizing
  useEffect(() => {
    if (!isMobile && filterOpen) {
      setFilterOpen(false);
    }
  }, [isMobile, filterOpen]);

  return (
    <main className="min-h-screen bg-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-6 flex justify-between items-center bg-white">
        <div ref={logoRef} className="flex items-center transition-all duration-300">
          <h1 className="text-2xl sm:text-3xl font-bold">TIMELESS PALETTE</h1>
        </div>
        <button
          onClick={toggleMenu}
          className="bg-black text-white p-2 sm:p-3 md:p-4"
          aria-label="Open menu"
        >
          <Menu size={isMobile ? 18 : 24} />
        </button>
      </header>

      {/* Menu Overlay - Navigation menu with Shop highlighted */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white z-40 flex items-center justify-center">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-4 bg-black text-white p-2 sm:p-3 md:p-4"
            aria-label="Close menu"
          >
            <Menu size={isMobile ? 18 : 24} />
          </button>
          <nav className="text-xl sm:text-2xl md:text-3xl space-y-4 sm:space-y-6">
            <NavLink
              to="/"
              className={({ isActive }) => `block hover:underline ${isActive ? "font-bold" : ""}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/artists"
              className={({ isActive }) => `block hover:underline ${isActive ? "font-bold" : ""}`}
            >
              Artists
            </NavLink>
            <NavLink
              to="/visit"
              className={({ isActive }) => `block hover:underline ${isActive ? "font-bold" : ""}`}
            >
              Visit
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => `block hover:underline ${isActive ? "font-bold" : ""}`}
            >
              About
            </NavLink>
            <NavLink
              to="/shop"
              className={({ isActive }) => `block hover:underline ${isActive ? "font-bold" : ""}`}
            >
              Shop
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => `block hover:underline ${isActive ? "font-bold" : ""}`}
            >
              Contact
            </NavLink>
          </nav>
        </div>
      )}

      {/* Shop Header */}
      <section className="bg-gray-100 py-12 pt-24" id="page-1">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">TIMELESS PALETTE SHOP</h1>
          <p className="text-xl max-w-3xl">
            Discover museum-quality framed prints from our collection of contemporary artists. Each piece is
            hand-crafted with premium materials and archival inks.
          </p>
        </div>
      </section>

      {/* Shop Controls */}
      <section className="border-b border-gray-200 py-4 sticky top-[72px] bg-white z-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              {isMobile ? (
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center py-2 px-4 border border-gray-300 rounded"
                >
                  <Filter size={18} className="mr-2" />
                  <span>Filter</span>
                </button>
              ) : (
                <div className="hidden md:flex items-center space-x-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`text-sm font-medium ${
                        activeCategory === category.id
                          ? "text-black border-b-2 border-black"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search artwork..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="py-2 px-4 pr-10 border border-gray-300 rounded w-full md:w-64"
                />
                <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Search size={18} />
                </button>
              </form>
              <div className="hidden md:flex items-center space-x-2 border border-gray-300 rounded">
                <button
                  onClick={() => setViewType("grid")}
                  className={`p-2 ${viewType === "grid" ? "bg-gray-100" : ""}`}
                  aria-label="Grid view"
                >
                  <GridIcon size={18} />
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`p-2 ${viewType === "list" ? "bg-gray-100" : ""}`}
                  aria-label="List view"
                >
                  <ListIcon size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Panel */}
      {isMobile && filterOpen && (
        <div className="fixed inset-0 bg-white z-30 overflow-y-auto pt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Filter</h2>
              <button onClick={() => setFilterOpen(false)} className="p-2">
                ×
              </button>
            </div>
            <div className="mb-8">
              <h3 className="font-medium mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`block w-full text-left py-1 ${
                      activeCategory === category.id ? "font-medium text-black" : "text-gray-600"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-8">
              <h3 className="font-medium mb-4">Styles</h3>
              <div className="flex flex-wrap gap-2">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm"
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setFilterOpen(false)}
              className="w-full py-3 bg-black text-white font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Shop Content */}
      <section className="py-12" id="page-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-4">Categories</h3>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`block w-full text-left py-1 ${
                          activeCategory === category.id
                            ? "font-medium text-black"
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-4">Styles</h3>
                  <div className="flex flex-wrap gap-2">
                    {styles.map((style) => (
                      <button
                        key={style.id}
                        className="px-3 py-1 border border-gray-300 rounded-full text-sm mb-2 hover:bg-gray-100"
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <h3 className="font-bold text-lg mb-4">Price Range</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="price-1" className="mr-2" />
                      <label htmlFor="price-1">Under $200</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="price-2" className="mr-2" />
                      <label htmlFor="price-2">$200 - $300</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="price-3" className="mr-2" />
                      <label htmlFor="price-3">$300 - $400</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="price-4" className="mr-2" />
                      <label htmlFor="price-4">$400+</label>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
            <div className="flex-grow">
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-600">
                  Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of{" "}
                  {filteredProducts.length} artworks
                </p>
                <div className="hidden md:block">
                  <select className="border border-gray-300 rounded py-1 px-2">
                    <option>Sort by Featured</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest First</option>
                  </select>
                </div>
              </div>
              {viewType === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentProducts.map((product) => (
                    <div key={product.id} className="group">
                      <div className="relative mb-4 aspect-[3/4] overflow-hidden border border-gray-200">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button className="bg-white text-black py-2 px-4 font-medium transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            View Details
                          </button>
                        </div>
                      </div>
                      <h3 className="font-medium text-lg">{product.title}</h3>
                      <p className="text-gray-600 mb-2">by {product.artist}</p>
                      <p className="font-bold">${product.price.toFixed(2)}</p>
                      <button className="mt-3 w-full py-2 border border-black font-medium hover:bg-black hover:text-white transition-colors duration-300 flex items-center justify-center">
                        <ShoppingBag size={16} className="mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {viewType === "list" && (
                <div className="space-y-6">
                  {currentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-col sm:flex-row border border-gray-200 p-4 group hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="sm:w-1/3 mb-4 sm:mb-0 sm:mr-6">
                        <div className="aspect-[3/4] relative overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>
                      <div className="sm:w-2/3 flex flex-col">
                        <h3 className="font-medium text-xl mb-2">{product.title}</h3>
                        <p className="text-gray-600 mb-2">by {product.artist}</p>
                        <p className="text-sm text-gray-600 mb-4">
                          Category: {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.styles.map((style) => (
                            <span key={style} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                              {style.charAt(0).toUpperCase() + style.slice(1)}
                            </span>
                          ))}
                        </div>
                        <p className="font-bold text-lg mb-4">${product.price.toFixed(2)}</p>
                        <div className="mt-auto flex flex-wrap gap-2">
                          <button className="py-2 px-4 bg-black text-white font-medium hover:bg-gray-800 transition-colors duration-300 flex items-center">
                            <ShoppingBag size={16} className="mr-2" />
                            Add to Cart
                          </button>
                          <button className="py-2 px-4 border border-black font-medium hover:bg-gray-100 transition-colors duration-300">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {totalShopPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevShopPage}
                      disabled={currentShopPage === 1}
                      className={`p-2 rounded-full ${
                        currentShopPage === 1 ? "text-gray-400" : "text-black hover:bg-gray-100"
                      }`}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    {[...Array(totalShopPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goToShopPage(i + 1)}
                        className={`w-10 h-10 rounded-full ${
                          currentShopPage === i + 1 ? "bg-black text-white" : "text-black hover:bg-gray-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={nextShopPage}
                      disabled={currentShopPage === totalShopPages}
                      className={`p-2 rounded-full ${
                        currentShopPage === totalShopPages ? "text-gray-400" : "text-black hover:bg-gray-100"
                      }`}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-gray-100" id="page-3">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <div className="aspect-[4/3] overflow-hidden mb-4">
                <img
                  src="/images/surya-art-1.png"
                  alt="Abstract Collection"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-medium mb-2">Abstract Expressions</h3>
              <p className="text-gray-600 mb-4">Explore our curated collection of abstract paintings and prints.</p>
              <a href="#" className="font-medium underline">
                View Collection
              </a>
            </div>
            <div className="group">
              <div className="aspect-[4/3] overflow-hidden mb-4">
                <img
                  src="/images/surya-art-2.png"
                  alt="Black & White Collection"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-medium mb-2">Monochrome Masterpieces</h3>
              <p className="text-gray-600 mb-4">Discover the power of black and white photography and art.</p>
              <a href="#" className="font-medium underline">
                View Collection
              </a>
            </div>
            <div className="group">
              <div className="aspect-[4/3] overflow-hidden mb-4">
                <img
                  src="/images/surya-art-3.png"
                  alt="Minimalist Collection"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-medium mb-2">Minimalist Designs</h3>
              <p className="text-gray-600 mb-4">Less is more with our collection of minimalist artwork.</p>
              <a href="#" className="font-medium underline">
                View Collection
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Spotlight */}
      <section className="py-16" id="page-4">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10 text-center">Artist Spotlight</h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/3">
              <div className="aspect-square relative">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">Artist Photo</p>
                </div>
              </div>
            </div>
            <div className="md:w-2/3">
              <h3 className="text-2xl font-bold mb-2">Emma Richardson</h3>
              <p className="text-gray-600 mb-6">Contemporary Abstract Painter</p>
              <p className="text-lg mb-6">
                Emma Richardson creates vibrant abstract works that explore the relationship between color, form, and
                emotion. Her paintings are characterized by bold brushstrokes and a dynamic use of color that evokes a
                sense of movement and energy.
              </p>
              <p className="mb-8">
                Based in New York, Emma has exhibited her work in galleries across the United States and Europe. Her
                pieces are held in numerous private collections and have been featured in several contemporary art
                publications.
              </p>
              <button className="py-3 px-6 bg-black text-white font-medium hover:bg-gray-800 transition-colors duration-300">
                Explore Artist's Collection
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16" id="page-5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">TIMELESS PALETTE</h3>
              <p className="text-gray-400">
                A space for bold art and new ideas, dedicated to showcasing contemporary artistic expressions.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <NavLink to="/" className="text-gray-400 hover:text-white">
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" className="text-gray-400 hover:text-white">
                    About
                  </NavLink>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Exhibitions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Artists
                  </a>
                </li>
                <li>
                  <NavLink to="/shop" className="text-gray-400 hover:text-white">
                    Shop
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact" className="text-gray-400 hover:text-white">
                    Contact
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">Subscribe to receive updates on new exhibitions and events.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-800 text-white px-4 py-2 flex-grow focus:outline-none"
                />
                <button className="bg-white text-black px-4 py-2">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500">© {new Date().getFullYear()} Timeless Palette. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Page Indicator */}
      <div className="fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50 bg-white bg-opacity-80 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full">
        <span className="text-xs sm:text-sm font-medium">
          {currentPage} / {totalPages}
        </span>
      </div>
    </main>
  );
}

export default Shop;