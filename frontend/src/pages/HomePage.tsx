import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header'; // Adjusted path
// import Footer from '../components/common/Footer'; // For later

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow"> {/* Removed container and p-4 from main for full-width sections */}
        {/* Hero Section Starts */}
        <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-20 md:py-32 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              Craft Your Professional CV in Minutes
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
              Choose from a variety of modern, field-tested templates, customize with ease, and impress recruiters.
              Your dream job is closer than you think. Get started for free!
            </p>
            <Link
              to="/register"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 px-10 rounded-lg text-lg sm:text-xl transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              Start Creating Your CV
            </Link>
          </div>
        </section>
        {/* Hero Section Ends */}

        {/* Other sections (How it Works, Template Preview, etc.) will go here */}
        <div className="container mx-auto p-4 py-16"> {/* This is the container for subsequent sections */}
          {/* How It Works Section Starts */}
          <section id="features" className="py-12 md:py-16"> {/* Changed py-16 to py-12 or md:py-16 as container already has py-16 */}
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 mb-12 md:mb-16 max-w-2xl mx-auto">
                Creating your perfect CV is simple with our intuitive platform. Follow these easy steps to get started.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center">
                <div className="bg-indigo-100 p-4 rounded-full mb-6">
                  {/* Heroicon: Document Add (Outline) */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">1. Upload or Start Fresh</h3>
                <p className="text-gray-500 leading-relaxed">
                  Easily upload your existing LinkedIn PDF or choose to build your CV from scratch with our guided process.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center">
                <div className="bg-purple-100 p-4 rounded-full mb-6">
                  {/* Heroicon: Template (Outline) */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">2. Choose a Template</h3>
                <p className="text-gray-500 leading-relaxed">
                  Select from our library of professionally designed free and premium templates, tailored for various industries.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-pink-100 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center">
                <div className="bg-pink-200 p-4 rounded-full mb-6"> {/* Note: Icon color adjusted for bg */}
                  {/* Heroicon: Pencil Alt (Outline) */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">3. Customize & Edit</h3>
                <p className="text-gray-500 leading-relaxed">
                  Personalize your CV content, colors, fonts, and layout with our intuitive real-time editor.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-green-100 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center">
                <div className="bg-green-200 p-4 rounded-full mb-6"> {/* Note: Icon color adjusted for bg */}
                  {/* Heroicon: Download (Outline) */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">4. Download & Impress</h3>
                <p className="text-gray-500 leading-relaxed">
                  Generate your polished CV as a PDF, ready to make a great impression on potential employers.
                </p>
              </div>
            </div>
          </section>
          {/* How It Works Section Ends */}
        </div> {/* Closing the container for "How it Works" and "Future Sections Area" */}

        {/* Template Preview Section Starts */}
        <section id="templates" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                Professionally Designed Templates
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Browse our collection of modern and effective CV templates. Find the perfect one to match your style and industry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {/* Template Card 1 */}
              <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center">
                <img 
                  src="https://placehold.co/300x420/E0E7FF/4F46E5?text=Template+A&font=montserrat" 
                  alt="CV Template A Preview" 
                  className="w-full h-auto object-cover rounded-md mb-4"
                />
                <h4 className="text-lg font-semibold text-gray-700 mb-1">Modern Executive</h4>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Free</span>
              </div>

              {/* Template Card 2 */}
              <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center">
                <img 
                  src="https://placehold.co/300x420/DBEAFE/1D4ED8?text=Template+B&font=lato" 
                  alt="CV Template B Preview" 
                  className="w-full h-auto object-cover rounded-md mb-4"
                />
                <h4 className="text-lg font-semibold text-gray-700 mb-1">Creative Portfolio</h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Premium</span>
              </div>

              {/* Template Card 3 */}
              <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center">
                <img 
                  src="https://placehold.co/300x420/D1FAE5/059669?text=Template+C&font=roboto" 
                  alt="CV Template C Preview" 
                  className="w-full h-auto object-cover rounded-md mb-4"
                />
                <h4 className="text-lg font-semibold text-gray-700 mb-1">Minimalist Professional</h4>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Free</span>
              </div>
              
              {/* Template Card 4 (Optional) */}
              <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center sm:col-span-2 lg:col-span-1"> {/* Spans 2 cols on sm, 1 on lg for balance if 3 items */}
                <img 
                  src="https://placehold.co/300x420/FEE2E2/DC2626?text=Template+D&font=oswald" 
                  alt="CV Template D Preview" 
                  className="w-full h-auto object-cover rounded-md mb-4"
                />
                <h4 className="text-lg font-semibold text-gray-700 mb-1">Academic Standard</h4>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Free</span>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                to="/templates" // Assuming a future page for all templates
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
              >
                Explore More Designs
              </Link>
            </div>
          </div>
        </section>
        {/* Template Preview Section Ends */}
        
        {/* This container was for the "Future Sections Area" text, which is now removed as we add more sections */}
        {/* <div className="container mx-auto p-4 py-16">  */}
          {/* Placeholder for next sections */}
          {/* <h2 className="text-2xl font-bold text-center text-gray-700 mt-16">Future Sections Area</h2> */}
          {/* <p className="text-center text-gray-500 mt-2">More content like "Template Previews", etc., will be added here.</p> */}
        {/* </div> */}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
