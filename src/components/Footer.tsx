import React from 'react';
import { Bot, Globe, Phone, Video } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="bg-gray-900 dark:bg-black text-white py-16 w-full">
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">agentlybot.com</span>
          </div>
          <p className="text-gray-400 mb-4">
            The future of AI-powered customer interactions. Build intelligent agents that work 24/7.
          </p>
          <div className="flex space-x-4">
            <Globe className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            <Phone className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            <Video className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Marketplace</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Resources</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
        <p>&copy; 2024 agentlybot.com. All rights reserved. Built with ❤️ for the future of AI.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
