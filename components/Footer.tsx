import React, { useState, useRef } from 'react';
import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY, SOCIAL_LINKS } from '../constants';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { smoothScrollToId } from '../utils/navigation';

export const Footer: React.FC = () => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyPhone = () => {
        navigator.clipboard.writeText(CONTACT_PHONE).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Не удалось скопировать номер: ', err);
        });
    };

    const sectionRef = useRef<HTMLElement>(null);
    const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.1 });
    
    const navLinks = [
        { href: '#services', text: 'Услуги' },
        { href: '#cosmetics', text: 'Уход Дома' },
        { href: '#price-calc', text: 'Комплекс' },
        { href: '#gift-certificates', text: 'Сертификаты' },
    ];

    return (
        <footer id="contacts" ref={sectionRef} className="pt-16 sm:pt-24 bg-secondary">
            <div className="container mx-auto px-4">
                <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="font-heading text-4xl sm:text-5xl font-normal text-center mb-12">Жду Вас в "Точке Гладкости"</h2>
                    
                    {/* 2GIS Reviews Block */}
                    <div className="max-w-3xl mx-auto mb-16 p-8 bg-surface rounded-2xl text-center shadow-lg border border-accent/30">
                        <h3 className="font-heading text-3xl text-accent mb-3">Ваши отзывы — моя главная награда</h3>
                        <div className="flex items-center justify-center gap-2 text-2xl text-yellow-400 mb-4">
                            <span>5.0</span>
                            <div className="flex">
                                <span className="fas fa-star"></span>
                                <span className="fas fa-star"></span>
                                <span className="fas fa-star"></span>
                                <span className="fas fa-star"></span>
                                <span className="fas fa-star"></span>
                            </div>
                        </div>
                        <blockquote className="text-text-muted italic mb-6 max-w-xl mx-auto">
                            "Лучший косметолог! Екатерина — настоящий профессионал своего дела. Результат после процедур превзошел все ожидания!"
                        </blockquote>
                        <a href={SOCIAL_LINKS.gis} target="_blank" rel="noopener noreferrer" className="cta-button px-8 py-3 inline-flex items-center gap-2">
                            Читать все отзывы на 2ГИС
                            <span className="fas fa-external-link-alt text-xs" aria-hidden="true"></span>
                        </a>
                    </div>

                    {/* Contact Info & Socials */}
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 border-t border-gray-700/50 pt-12">
                        {/* Left: Contact Details */}
                        <div>
                            <h3 className="font-heading text-2xl mb-6 text-center lg:text-left">Контакты</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <span className="fas fa-map-marker-alt text-accent text-2xl mt-1 w-6 text-center" aria-hidden="true"></span>
                                    <div>
                                        <h4 className="font-bold text-text-main">Адрес</h4>
                                        <p className="text-text-muted">д. Грановщина, ул. Георгия Буркова, 2</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                            <a href={SOCIAL_LINKS.gis} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                                                Открыть в 2ГИС
                                            </a>
                                            <a href="https://yandex.ru/maps/-/CLC~UBnk" target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                                                Открыть в Яндекс.Картах
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="fas fa-phone-alt text-accent text-2xl mt-1 w-6 text-center" aria-hidden="true"></span>
                                    <div>
                                        <h4 className="font-bold text-text-main">Телефон</h4>
                                        <a href={`tel:${CONTACT_PHONE}`} className="text-text-muted hover:text-accent transition-colors block">{CONTACT_PHONE_DISPLAY}</a>
                                        <button onClick={handleCopyPhone} className="text-sm text-accent hover:underline mt-1">
                                            {isCopied ? 'Скопировано!' : 'Копировать номер'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="fas fa-clock text-accent text-2xl mt-1 w-6 text-center" aria-hidden="true"></span>
                                    <div>
                                        <h4 className="font-bold text-text-main">Часы работы</h4>
                                        <p className="text-text-muted">Пн-Сб: 09:00 – 20:00</p>
                                        <p className="text-text-muted">Вс: Выходной</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right: Social Media */}
                        <div>
                            <h3 className="font-heading text-2xl mb-6 text-center lg:text-left">Следите за новостями</h3>
                            <div className="space-y-4">
                                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Перейти в наш Instagram" className="flex items-center p-4 bg-surface rounded-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-gray-700 group hover:shadow-lg hover:shadow-[#E4405F]/30">
                                    <span className="fab fa-instagram text-4xl mr-4 w-12 text-center" style={{color: '#E4405F'}} aria-hidden="true"></span>
                                    <div>
                                        <p className="font-bold text-text-main text-lg transition-colors group-hover:text-[#E4405F]">Instagram</p>
                                        <p className="text-text-muted text-sm">Акции, работы до/после и полезные советы.</p>
                                    </div>
                                </a>
                                <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" aria-label="Перейти в наш Telegram" className="flex items-center p-4 bg-surface rounded-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-gray-700 group hover:shadow-lg hover:shadow-sky-500/30">
                                    <span className="fab fa-telegram-plane text-4xl text-sky-500 mr-4 w-12 text-center" aria-hidden="true"></span>
                                    <div>
                                        <p className="font-bold text-text-main text-lg transition-colors group-hover:text-sky-500">Telegram</p>
                                        <p className="text-text-muted text-sm">Важные новости, анонсы и прямая связь.</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-16 py-8 bg-primary border-t border-gray-800">
                 <div className="container mx-auto px-4 text-center">
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
                        {navLinks.map(link => (
                            <a 
                                key={link.href} 
                                href={link.href} 
                                onClick={(e) => smoothScrollToId(e)} 
                                className="text-text-muted hover:text-accent transition-colors text-sm"
                            >
                                {link.text}
                            </a>
                        ))}
                    </div>
                    <p className="text-text-muted text-sm">&copy; {new Date().getFullYear()} Точка Гладкости. Все права защищены.</p>
                 </div>
            </div>
        </footer>
    );
};