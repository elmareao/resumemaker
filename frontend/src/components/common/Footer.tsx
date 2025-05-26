import React from 'react';
import { Link } from 'react-router-dom';

// Simple SVG icons for social media - replace with actual or more elaborate ones if needed
const SocialIcon: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">
    {children}
  </a>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Column 1: Application Name/Slogan (Optional) */}
          <div className="mb-6 md:mb-0">
            <Link to="/" className="text-2xl font-bold text-white hover:text-gray-300">
              CVBuilder
            </Link>
            <p className="mt-2 text-sm text-gray-400">
              Helping you create the perfect CV, effortlessly.
            </p>
          </div>

          {/* Column 2: Company Links */}
          <div>
            <h5 className="font-semibold text-gray-200 mb-4">Company</h5>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">Contact</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">Pricing</Link></li>
              {/* Add more company links as needed */}
            </ul>
          </div>

          {/* Column 3: Legal Links */}
          <div>
            <h5 className="font-semibold text-gray-200 mb-4">Legal</h5>
            <ul className="space-y-2">
              <li><Link to="/terms-of-service" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">Terms of Service</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Social Media (Optional) */}
          <div>
            <h5 className="font-semibold text-gray-200 mb-4">Follow Us</h5>
            <div className="flex space-x-4">
              <SocialIcon href="https://twitter.com/cvbuilderapp">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </SocialIcon>
              <SocialIcon href="https://linkedin.com/company/cvbuilderapp">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
              </SocialIcon>
              {/* Add Facebook, Instagram etc. as needed */}
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-700" />

        <div className="text-center text-sm text-gray-400">
          © {currentYear} CVBuilder. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
