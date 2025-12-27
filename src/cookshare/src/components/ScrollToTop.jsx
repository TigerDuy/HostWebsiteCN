import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./ScrollToTop.css";

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button
      className={`scroll-to-top ${isVisible ? "visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Cuộn lên đầu trang"
    >
      ↑
    </button>
  );
}

export default ScrollToTop;
