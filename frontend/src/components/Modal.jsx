import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-lg shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 p-6 m-4 max-w-lg w-full transform transition-all duration-300 scale-95 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
