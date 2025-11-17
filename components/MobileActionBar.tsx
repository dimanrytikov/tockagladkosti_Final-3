import React from 'react';
import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from '../constants';

interface MobileActionBarProps {
    onOpenModal: () => void;
}

const MobileActionBar: React.FC<MobileActionBarProps> = ({ onOpenModal }) => {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-secondary shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.3)] border-t border-surface z-40 p-3 lg:hidden animate-fade-in-up" style={{ animationDelay: '2s' }}>
            <div className="container mx-auto px-4 flex items-center justify-between gap-3">
                <a 
                    href={`tel:${CONTACT_PHONE}`}
                    className="flex flex-col items-center justify-center text-center px-3 py-2 rounded-lg text-text-muted hover:text-accent transition-colors"
                    aria-label={`Позвонить ${CONTACT_PHONE_DISPLAY}`}
                >
                    <span className="fas fa-phone-alt text-xl" aria-hidden="true"></span>
                    <span className="text-xs mt-1 font-medium">Позвонить</span>
                </a>
                <button
                    onClick={onOpenModal}
                    className="cta-button flex-grow text-base"
                >
                    Записаться Online
                </button>
            </div>
        </div>
    );
};

export default MobileActionBar;
