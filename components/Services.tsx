import React, { useRef, useState } from 'react';
import { servicesData } from '../constants';
import { ModalData, Service, CartItem } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface ServiceCardProps {
    service: Service;
    onAddToCart: (item: CartItem) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onAddToCart }) => {
    const [purchaseType, setPurchaseType] = useState<'session' | 'course'>('session');
    const [courseSessions, setCourseSessions] = useState(5);

    const hasCourseOption = !['detox', 'express-clean', 'premium'].includes(service.id);

    const handleAddToCartClick = () => {
        const isCourse = hasCourseOption && purchaseType === 'course';
        const discountedPricePerSession = Math.round(service.price * 0.9);
        
        const cartItem: CartItem = {
            id: `service-${service.id}-${isCourse ? `course-${courseSessions}` : 'session'}`,
            type: 'service',
            name: service.title,
            details: isCourse ? `Курс из ${courseSessions} сеансов` : 'Разовый сеанс',
            price: isCourse ? discountedPricePerSession * courseSessions : service.price,
            quantity: 1,
            serviceRef: service,
        };
        onAddToCart(cartItem);
    };

    const originalPrice = service.price;
    const discountedPrice = Math.round(originalPrice * 0.9);
    const isCourse = hasCourseOption && purchaseType === 'course';
    
    const finalPrice = isCourse
        ? discountedPrice * courseSessions
        : originalPrice;

    const totalSavings = isCourse 
        ? (originalPrice * courseSessions) - finalPrice
        : 0;

    return (
        <div className="bg-secondary rounded-xl shadow-lg h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/20 active:scale-95 active:brightness-90">
            <div className="p-6 flex flex-col h-full">
                <h3 className="font-heading text-xl sm:text-2xl font-normal mb-3">{service.category}</h3>
                <p className="text-lg font-semibold text-text-main mb-4">{service.title}</p>
                <p className="text-text-muted mb-6 font-sans flex-grow">{service.description}</p>
                
                {/* Purchase options */}
                <div className="mb-4 bg-primary p-4 rounded-xl">
                    {hasCourseOption ? (
                        <>
                            <div className="flex bg-surface rounded-lg p-1 mb-4">
                                <button 
                                    onClick={() => setPurchaseType('session')}
                                    className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${purchaseType === 'session' ? 'bg-accent text-text-on-accent' : 'text-text-muted hover:bg-gray-700'}`}
                                >
                                    1 Сеанс
                                </button>
                                <button 
                                    onClick={() => setPurchaseType('course')}
                                    className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors duration-300 ${purchaseType === 'course' ? 'bg-accent text-text-on-accent' : 'text-text-muted hover:bg-gray-700'}`}
                                >
                                    Курс (-10%)
                                </button>
                            </div>

                            {purchaseType === 'course' && (
                                <div className="flex items-center justify-between mb-3 animate-fade-in">
                                    <label className="text-text-main font-semibold">Кол-во сеансов:</label>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setCourseSessions(s => Math.max(5, s - 1))} className="w-8 h-8 rounded-md bg-surface hover:bg-accent hover:text-text-on-accent transition-colors">-</button>
                                        <span className="w-8 text-center font-bold text-lg">{courseSessions}</span>
                                        <button onClick={() => setCourseSessions(s => Math.min(10, s + 1))} className="w-8 h-8 rounded-md bg-surface hover:bg-accent hover:text-text-on-accent transition-colors">+</button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null }

                    <div className="text-center mt-3">
                        {isCourse && (
                             <p className="text-sm text-accent mb-1">
                                {discountedPrice.toLocaleString('ru-RU')} р. за сеанс
                            </p>
                        )}
                        <p className="text-2xl sm:text-3xl font-bold text-accent font-sans">
                            {finalPrice.toLocaleString('ru-RU')} р.
                        </p>
                        {isCourse && totalSavings > 0 && (
                            <p className="text-sm text-green-400 font-semibold mt-1">
                                Ваша экономия: {totalSavings.toLocaleString('ru-RU')} р.
                            </p>
                        )}
                    </div>
                </div>


                <p className="text-base lg:text-lg text-text-muted font-normal text-center mb-5">Длительность сеанса: {service.duration}</p>

                <button 
                    onClick={handleAddToCartClick} 
                    className="w-full cta-button px-8 py-3 mt-auto flex items-center justify-center gap-2">
                    <span className="fas fa-shopping-basket" aria-hidden="true"></span>
                    Добавить в корзину
                </button>
            </div>
        </div>
    );
};

interface ServicesProps {
    onOpenModal: (data: ModalData) => void;
    onAddToCart: (item: CartItem) => void;
}

const Services: React.FC<ServicesProps> = ({ onOpenModal, onAddToCart }) => {
    const sectionRef = useRef<HTMLElement>(null);
    const isVisible = useIntersectionObserver(sectionRef, { threshold: 0.05 });
    const [activeCategoryId, setActiveCategoryId] = useState(servicesData[0].id);
    const [contentKey, setContentKey] = useState(0);

    const handleCategoryClick = (categoryId: string) => {
        setActiveCategoryId(categoryId);
        setContentKey(prev => prev + 1); // Trigger animation
    }

    const activeCategoryData = servicesData.find(cat => cat.id === activeCategoryId);

    return (
        <section id="services" ref={sectionRef} className="py-16 sm:py-24 bg-primary">
            <div className="container mx-auto px-4">
                <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <h2 className="font-heading text-4xl sm:text-5xl font-normal text-center mb-4">Архитектура Вашей Молодости</h2>
                    <p className="text-lg text-center text-text-muted font-sans mb-12 max-w-3xl mx-auto">Выберите направление, чтобы ознакомиться с услугами, или добавьте курс в корзину для оформления заявки.</p>
                </div>

                <div className={`max-w-4xl mx-auto mb-16 p-6 bg-secondary rounded-2xl border border-accent/50 shadow-lg text-center transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
                    <h3 className="font-heading text-2xl text-accent mb-2">Выгодный Курс</h3>
                    <p className="text-lg text-text-main">
                        При выборе курса из 5-10 сеансов на <strong>любую из уходовых процедур</strong> — Вы получаете скидку <strong>10%</strong> на каждую процедуру.
                        <br/>
                        <span className="text-base text-green-400 font-semibold">Например, на курсе SPA-ухода ваша экономия составит 2 500 р.!</span>
                    </p>
                </div>
                
                <div className={`max-w-7xl mx-auto lg:grid lg:grid-cols-4 lg:gap-8 xl:gap-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
                    {/* Left Navigation Panel */}
                    <aside className="lg:col-span-1 mb-12 lg:mb-0">
                        <nav className="lg:sticky lg:top-32 bg-secondary p-4 rounded-2xl">
                             <h3 className="font-heading text-xl text-text-main mb-4 px-2">Направления</h3>
                            <ul className="space-y-1">
                                {servicesData.map(category => (
                                    <li key={category.id}>
                                        <button
                                            onClick={() => handleCategoryClick(category.id)}
                                            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-accent/80 hover:bg-surface ${
                                                activeCategoryId === category.id
                                                    ? 'bg-accent text-text-on-accent shadow-md'
                                                    : 'text-text-muted hover:text-accent'
                                            }`}
                                        >
                                            {category.icon && <span className={`${category.icon} w-5 text-center text-lg`}></span>}
                                            <span className="flex-grow">{category.title}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>

                    {/* Right Content Panel */}
                    <div className="lg:col-span-3">
                        {activeCategoryData && (
                             <div key={contentKey} className="animate-fade-in">
                                <div className="text-center lg:text-left mb-10 max-w-3xl mx-auto lg:mx-0">
                                    <h3 className="font-heading text-2xl sm:text-3xl font-normal mb-3">{activeCategoryData.title}</h3>
                                    <p className="text-text-muted text-base">{activeCategoryData.description}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 font-sans">
                                    {activeCategoryData.services.map((service, index) => (
                                        <div 
                                            key={`${activeCategoryId}-${service.id}-${index}`}
                                            className="animate-fade-in-up"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <ServiceCard service={service} onAddToCart={onAddToCart} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;