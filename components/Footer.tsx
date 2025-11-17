import React, { useState, useRef, useEffect } from 'react';
import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY, SOCIAL_LINKS } from '../constants';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export const Footer: React.FC = () => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyPhone = () => {
        // Используем чистую версию номера для буфера обмена
        navigator.clipboard.writeText(CONTACT_PHONE).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000); // Подсказка исчезает через 2 секунды
        }).catch(err => {
            console.error('Не удалось скопировать номер: ', err);
        });
    };

    const sectionRef = useRef<HTMLElement>(null);
    const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });

    return (
        <footer id="contacts" ref={sectionRef} className="pt-12 sm:pt-20 bg-secondary">
            <div className="container mx-auto px-4">
                <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="font-heading text-4xl sm:text-5xl font-normal text-center mb-10">Жду Вас в "Точке Гладкости"</h2>
                    <div className="max-w-6xl mx-auto pb-12">
                        <div className="grid lg:grid-cols-2 gap-8 items-center font-sans">
                            {/* Column 1: Contact Details & Socials */}
                            <div>
                                <div className="space-y-6 text-lg">
                                    <div className="flex items-start">
                                        <span className="fas fa-map-marker-alt text-accent text-2xl w-8 mt-1" aria-hidden="true"></span>
                                        <div>
                                            <strong className="text-text-main">Адрес:</strong>
                                            <a href={SOCIAL_LINKS.gis} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent transition-colors duration-200 block" aria-label="Открыть адрес в 2ГИС">
                                                д. Грановщина, ул. Георгия Буркова, 2
                                            </a>
                                            {/* Review block */}
                                            <div className="mt-2">
                                                <a href={SOCIAL_LINKS.gis} target="_blank" rel="noopener noreferrer"
                                                   className="inline-flex items-center gap-2 text-sm bg-surface px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors duration-200 group">
                                                    <span className="font-bold text-yellow-400">5.0 ★★★★★</span>
                                                    <span className="text-text-muted group-hover:text-accent transition-colors">
                                                        Читать и оставить отзыв
                                                    </span>
                                                    <span className="fas fa-external-link-alt text-xs text-text-muted group-hover:text-accent transition-colors" aria-hidden="true"></span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="fas fa-clock text-accent text-2xl w-8 mt-1" aria-hidden="true"></span>
                                        <div>
                                            <strong className="text-text-main">Часы работы:</strong>
                                            <p className="text-text-muted">Понедельник - Суббота: 09:00 – 20:00</p>
                                            <p className="text-text-muted">Воскресенье: Выходной</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="fas fa-phone-alt text-accent text-2xl w-8 mt-1" aria-hidden="true"></span>
                                        <div>
                                            <strong className="text-text-main">Телефон (Екатерина):</strong>
                                            <div className="relative flex items-center gap-x-3">
                                                <a href={`tel:${CONTACT_PHONE}`} className="text-text-muted hover:text-accent transition-colors duration-200">{CONTACT_PHONE_DISPLAY}</a>
                                                <button onClick={handleCopyPhone} title="Копировать номер" className="text-text-muted hover:text-accent transition-colors duration-200 text-base">
                                                    <span className="far fa-copy" aria-hidden="true"></span>
                                                </button>
                                                {isCopied && (
                                                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-text-main text-primary text-xs rounded-md shadow-lg">
                                                        Скопировано!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* NEW Social Media Block */}
                                <div className="mt-8 pt-5 border-t border-gray-700/50">
                                    <h3 className="font-heading text-xl text-text-main mb-4">Следите за новостями и акциями</h3>
                                    <div className="space-y-3">
                                        <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Перейти в наш Instagram" className="flex items-center p-3 bg-surface rounded-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-gray-700 group hover:shadow-lg hover:shadow-[#E4405F]/30">
                                            <span className="fab fa-instagram text-3xl mr-3 w-10 text-center" style={{color: '#E4405F'}} aria-hidden="true"></span>
                                            <div>
                                                <p className="font-bold text-text-main text-base transition-colors group-hover:text-[#E4405F]">Instagram</p>
                                            </div>
                                        </a>
                                        <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" aria-label="Перейти в наш Telegram" className="flex items-center p-3 bg-surface rounded-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-gray-700 group hover:shadow-lg hover:shadow-sky-500/30">
                                            <span className="fab fa-telegram-plane text-3xl text-sky-500 mr-3 w-10 text-center" aria-hidden="true"></span>
                                            <div>
                                                <p className="font-bold text-text-main text-base transition-colors group-hover:text-sky-500">Telegram</p>
                                            </div>
                                        </a>
                                        <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Написать нам в WhatsApp" className="flex items-center p-3 bg-surface rounded-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-gray-700 group hover:shadow-lg hover:shadow-green-500/30">
                                            <span className="fab fa-whatsapp text-3xl text-green-500 mr-3 w-10 text-center" aria-hidden="true"></span>
                                            <div>
                                                <p className="font-bold text-text-main text-base transition-colors group-hover:text-green-500">WhatsApp</p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Embedded Map */}
                            <div className="w-full h-[300px] lg:h-[450px] bg-surface rounded-2xl overflow-hidden shadow-lg">
                                <iframe
                                    src="https://yandex.ru/map-widget/v1/-/CLGy5W9H"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    allowFullScreen={true}
                                    title="Карта проезда до Точки Гладкости"
                                    loading="lazy"
                                    style={{ filter: 'invert(90%) hue-rotate(180deg)' }}
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="py-6 bg-primary border-t border-gray-800">
                 <div className="container mx-auto px-4 text-center">
                     <p className="text-text-muted text-sm">&copy; {new Date().getFullYear()} Точка Гладкости. Все права защищены.</p>
                 </div>
            </div>
        </footer>
    );
};