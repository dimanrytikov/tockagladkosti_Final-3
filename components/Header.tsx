import React, { useState, useEffect } from 'react';
import { SOCIAL_LINKS, CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from '../constants';
import { smoothScrollToId } from '../utils/navigation';

interface HeaderProps {
    onOpenModal: () => void;
    cartItemCount: number;
    onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenModal, cartItemCount, onCartClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    useEffect(() => {
        const sections = document.querySelectorAll('section[id]');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-30% 0px -70% 0px', threshold: 0 }
        );

        sections.forEach((section) => {
            observer.observe(section);
        });

        return () => {
            sections.forEach((section) => {
                observer.unobserve(section);
            });
        };
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);
    
    const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        smoothScrollToId(event);
        if (isMenuOpen) {
            setIsMenuOpen(false);
        }
    };

    const handleLogoClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (isMenuOpen) setIsMenuOpen(false);
    };

    const NavLinks: React.FC<{mobile?: boolean}> = ({ mobile = false }) => {
        const mobileBaseClass = "transition-colors duration-300 hover:text-accent";
        const mobileClass = `block py-2 text-2xl font-heading ${mobileBaseClass}`;
        const desktopClass = `nav-link-desktop text-base`;
        
        const linkData = [
            { href: '#price-calc', text: 'Эпиляция' },
            { href: '#services', text: 'SPA & Уходы' },
            { href: '#cosmetics', text: 'Космецевтика' },
            { href: '#gift-certificates', text: 'Сертификаты' },
            { href: '#contacts', text: 'Контакты' },
        ];

        return (
            <>
                {linkData.map(link => (
                    <a 
                        key={link.href}
                        href={link.href} 
                        onClick={handleNavClick} 
                        className={`${mobile ? mobileClass : desktopClass} ${!mobile && activeSection === link.href.substring(1) ? 'active' : ''}`}
                    >
                        {link.text}
                    </a>
                ))}
            </>
        );
    };

    return (
        <>
            <header className="fixed top-0 left-0 w-full bg-primary/80 backdrop-blur-md z-50 shadow-lg">
                <div className="container mx-auto px-4 h-24 flex justify-between items-center">
                    {/* Logo */}
                    <button onClick={handleLogoClick} className="font-heading text-lg sm:text-xl font-normal text-text-main whitespace-nowrap text-left z-50">
                        <div>
                            <span className="text-2xl sm:text-3xl text-accent">Т</span>ОЧКА
                            <span className="text-2xl sm:text-3xl text-accent">Г</span>ЛАДКОСТИ
                        </div>
                    </button>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8 text-text-muted">
                        <NavLinks />
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        {/* Desktop Icons with Tooltips */}
                        <div className="hidden lg:flex items-center space-x-4">
                            <div className="relative group flex items-center justify-center">
                                <a href={SOCIAL_LINKS.gis} target="_blank" rel="noopener noreferrer" aria-label="Открыть в 2ГИС">
                                    <span className="fas fa-map-marker-alt text-2xl text-text-muted transition-colors group-hover:text-accent cursor-pointer" aria-hidden="true"></span>
                                </a>
                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-max max-w-xs bg-surface text-text-main text-sm rounded-md p-3 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none text-center">
                                    <p className="font-bold">д. Грановщина, ул. Георгия Буркова, 2</p>
                                    <p className="text-text-muted text-xs">Пн-Сб: 09:00 – 20:00</p>
                                </div>
                            </div>
                             <div className="relative group flex items-center justify-center">
                                <a href={`tel:${CONTACT_PHONE}`} aria-label="Позвонить">
                                    <span className="fas fa-phone text-2xl text-text-muted transition-colors group-hover:text-accent cursor-pointer" aria-hidden="true"></span>
                                </a>
                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-max max-w-xs bg-surface text-text-main text-sm rounded-md p-3 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none text-center">
                                    <p className="font-bold">{CONTACT_PHONE_DISPLAY}</p>
                                    <p className="text-text-muted text-xs">Екатерина (Ваш косметолог)</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={onCartClick} className="relative text-2xl text-text-main hover:text-accent transition duration-300" aria-label="Открыть корзину">
                            <span className="fas fa-shopping-basket" aria-hidden="true"></span>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-accent text-text-on-accent text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-jiggle">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                        
                        <button onClick={onOpenModal} className="hidden md:block cta-button px-5 py-2 text-sm flex items-center gap-2">
                            <span className="far fa-calendar-alt" aria-hidden="true"></span>
                            <span>Записаться</span>
                        </button>

                        <button id="menu-toggle" className="lg:hidden text-3xl text-text-main z-50" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Открыть меню" aria-expanded={isMenuOpen}>
                            <span className={`transition-transform duration-300 ease-in-out block ${isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}`} aria-hidden="true"></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div onClick={() => setIsMenuOpen(false)} className={`fixed inset-0 bg-black/60 z-30 transition-opacity lg:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
            
            {/* Mobile Menu Panel */}
            <div id="mobile-menu-panel" className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-secondary shadow-2xl z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full p-6 pt-24 font-sans">
                    <nav className="flex flex-col space-y-2 text-center">
                        <NavLinks mobile />
                    </nav>
                    <div className="mt-auto space-y-4">
                        <button onClick={() => { onOpenModal(); setIsMenuOpen(false); }} className="w-full cta-button text-base">
                            Записаться Online
                        </button>
                        <div className="text-center text-sm text-text-main leading-tight pt-4">
                            <a href={`tel:${CONTACT_PHONE}`} className="font-semibold block hover:text-accent transition-colors">📞 {CONTACT_PHONE_DISPLAY}</a>
                            <p className="font-semibold mt-2">📍 д. Грановщина, ул. Георгия Буркова, 2</p>
                            <p className="text-text-muted text-xs">Пн-Сб: 09:00 – 20:00</p>
                        </div>
                        <div className="flex justify-center space-x-6 pt-4 text-2xl text-text-muted border-t border-surface">
                            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent" aria-label="Перейти в Instagram"><span className="fab fa-instagram" aria-hidden="true"></span></a>
                            <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-accent" aria-label="Перейти в Telegram"><span className="fab fa-telegram-plane" aria-hidden="true"></span></a>
                            <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-accent" aria-label="Написать в WhatsApp"><span className="fab fa-whatsapp" aria-hidden="true"></span></a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};