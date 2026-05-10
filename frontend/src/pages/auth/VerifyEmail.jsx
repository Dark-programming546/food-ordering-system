import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  // Background images (same as register page)
  const backgroundImages = [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&auto=format',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1920&auto=format',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&auto=format',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&auto=format',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1920&auto=format',
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1920&auto=format',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    setLoading(true);
    const result = await verifyEmail(email, code);
    if (result.success) {
      navigate('/login');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    await resendVerification(email);
    setResending(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        {backgroundImages.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentImage === index ? 1 : 0,
            }}
          >
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-3 drop-shadow-lg">📧</div>
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">Verify Your Email</h2>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20">
            <div className="text-center mb-6">
              <p className="text-white/80 text-sm">
                We've sent a verification code to:
                <br />
                <span className="text-orange-400 font-semibold">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-center text-2xl tracking-widest py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="000000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FiCheckCircle />
                    <span>Verify Email</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-orange-400 hover:text-orange-300 text-sm flex items-center justify-center space-x-1 mx-auto"
              >
                <FiRefreshCw className={resending ? 'animate-spin' : ''} />
                <span>{resending ? 'Sending...' : 'Resend Code'}</span>
              </button>
              <p className="text-white/50 text-xs mt-3">Check your spam folder if you don't see the email.</p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/20 text-center">
              <Link to="/login" className="text-white/60 hover:text-white text-sm">
                ← Back to Login
              </Link>
            </div>
          </div>

          <div className="mt-6 flex justify-center space-x-2">
            {backgroundImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`transition-all duration-300 ${
                  currentImage === index
                    ? 'w-6 h-1.5 bg-white rounded-full'
                    : 'w-1.5 h-1.5 bg-white/50 rounded-full hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmail;