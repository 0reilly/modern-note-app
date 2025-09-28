import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FileText, Zap, Users, Shield } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const features = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Rich Text Editor',
      description: 'Create beautiful notes with our powerful rich text editor supporting markdown and formatting.',
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Real-time Collaboration',
      description: 'Work together with your team in real-time with live cursor positions and instant updates.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Team Workspaces',
      description: 'Organize your notes with teams, categories, and tags for better productivity.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure & Private',
      description: 'Your notes are encrypted and secure. We prioritize your privacy and data protection.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Modern Notes</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                to="/app/dashboard"
                className="btn-primary"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-ghost"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern Note Taking,
            <span className="text-primary-600"> Reinvented</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A beautiful, fast, and collaborative note-taking app inspired by Vercel's design. 
            Built with the modern web stack for the best user experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                to="/app/dashboard"
                className="btn-primary text-lg px-8 py-3"
              >
                Continue to App
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary text-lg px-8 py-3"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary text-lg px-8 py-3"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for modern note-taking
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built with the latest technologies and designed for productivity and collaboration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card p-6 text-center hover:shadow-vercel-lg transition-shadow duration-200"
              >
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            Built with ❤️ using the MERN stack. Inspired by Vercel's design philosophy.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;