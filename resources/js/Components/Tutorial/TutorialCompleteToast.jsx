import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, Trophy, X } from 'lucide-react';

const TutorialCompleteToast = ({ show, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            // Auto close after 5 seconds
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-8 right-8 z-[10002] max-w-md"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Tutorial Complete!</h3>
                                    <p className="text-green-100 text-sm">You're ready to build amazing apps! 🚀</p>
                                </div>
                            </div>
                            
                            {/* Close button */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            {/* Sparkles animation */}
                            <div className="absolute -top-1 -right-1">
                                <motion.div
                                    animate={{ 
                                        rotate: [0, 180, 360],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                >
                                    <Sparkles className="w-6 h-6 text-yellow-300" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Achievement stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                                        <CheckCircle className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">16</div>
                                    <div className="text-xs text-gray-500">Steps</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto bg-purple-100 rounded-xl flex items-center justify-center mb-2">
                                        <Sparkles className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">100%</div>
                                    <div className="text-xs text-gray-500">Complete</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto bg-emerald-100 rounded-xl flex items-center justify-center mb-2">
                                        <Trophy className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">1st</div>
                                    <div className="text-xs text-gray-500">Project</div>
                                </div>
                            </div>

                            {/* What you learned */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 text-sm">What you learned:</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>Workspace and project management</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>Visual building with Forge</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>Frame creation and management</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span>Source code generation</span>
                                    </div>
                                </div>
                            </div>

                            {/* Next steps */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                                <h4 className="font-semibold text-gray-900 text-sm mb-2">Ready for more? 🚀</h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Start building your app, explore components, and unleash your creativity!
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-2 px-4 rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-colors"
                                >
                                    Start Building! ✨
                                </button>
                            </div>
                        </div>

                        {/* Progress indicator */}
                        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
                    </div>

                    {/* Floating particles effect */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ 
                                    opacity: 0,
                                    y: 0,
                                    x: Math.random() * 300,
                                }}
                                animate={{ 
                                    opacity: [0, 1, 0],
                                    y: -60,
                                    x: Math.random() * 300,
                                }}
                                transition={{
                                    duration: 3,
                                    delay: i * 0.3,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                }}
                                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TutorialCompleteToast;