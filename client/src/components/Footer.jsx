import { ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { assets, footerLinks } from "../assets/assets";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-24 bg-primary/10">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30 text-gray-500">
        <div>
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => {
              navigate("/");
            }}
          >
            {/* LOGO */}
            <div
              className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br 
    from-yellow-400 via-yellow-500 to-amber-500 shadow-lg group-hover:shadow-yellow-300/50
    group-hover:scale-105 transition-all duration-300"
            >
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>

            {/* BRAND NAME */}
            <span className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent tracking-wide">
              SrisCart
            </span>
          </div>{" "}
          <p className="max-w-[410px] mt-6">
            We deliver fresh groceries and snacks straight to your door. Trusted
            by thousands, we aim to make your shopping experience simple and
            affordable
          </p>
        </div>
        <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">
                {section.title}
              </h3>
              <ul className="text-sm space-y-1">
                {section.links.map((link, i) => {
                  const isExternal = link.url.startsWith("http");
                  return (
                    <li key={i}>
                      {isExternal ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline transition"
                        >
                          {link.text}
                        </a>
                      ) : (
                        <Link
                          to={link.url}
                          className="hover:underline transition"
                        >
                          {link.text}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="py-4 text-center text-sm md:text-base text-gray-500/80">
        Copyright {new Date().getFullYear()} © SrisCart All Right Reserved.
      </p>
    </div>
  );
};

export default Footer;
