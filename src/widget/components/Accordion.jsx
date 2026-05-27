import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Accordion = ({ title, isOpen, onToggle, children }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-visible shadow-sm">
            <button
                onClick={onToggle}
                className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
                <span className="font-bold text-slate-800 text-sm">{title}</span>
                {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="p-5 pt-0 border-t border-slate-50">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Accordion;
