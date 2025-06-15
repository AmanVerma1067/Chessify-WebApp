"use client"

import { Github, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800/80 backdrop-blur-md border-t border-gray-700 py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="text-base text-gray-300 font-medium">
            © {new Date().getFullYear()} Chessify AI. All rights reserved.
          </div>

          <div className="text-base text-gray-300 font-medium">Made with 🧠 by Aman Verma</div>

          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/AmanVerma1067/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-200"
            >
              <Github className="h-6 w-6" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/amanverma1067/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-cyan-400 transition-colors duration-200"
            >
              <Linkedin className="h-6 w-6" />
              <span className="sr-only">LinkedIn</span>
            </a>
            <div className="text-sm text-gray-400 font-medium">Version 1.1.3</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
