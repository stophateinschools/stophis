
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-shisp-gray">
              &copy; {currentYear} Stop Hate in Schools. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a 
              href="https://www.stophateinschools.org/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-shisp-gray hover:text-shisp-blue transition-colors"
            >
              Terms
            </a>
            <a 
              href="https://www.stophateinschools.org/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-shisp-gray hover:text-shisp-blue transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="mailto:dashboard@stophateinschools.org" 
              className="text-sm text-shisp-gray hover:text-shisp-blue transition-colors"
            >
              Contact/Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
