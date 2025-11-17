import React from 'react';
import { SOCIAL_LINKS } from '../constants';

interface TelegramFloatProps {
    isVisible: boolean;
}

const TelegramFloat: React.FC<TelegramFloatProps> = ({ isVisible }) => {
    return (
        <a
            href={SOCIAL_LINKS.telegram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Перейти в наш Telegram канал"
            title="Наш Telegram канал"
            className={`fixed bottom-40 right-4 lg:bottom-28 lg:right-8 bg-[#2AABEE] text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300 ease-in-out hover:scale-110 z-40 animate-pulse-glow ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
            <span className="fab fa-telegram-plane" aria-hidden="true"></span>
        </a>
    );
};

export default TelegramFloat;