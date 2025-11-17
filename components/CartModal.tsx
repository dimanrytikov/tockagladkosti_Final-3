import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CartItem } from '../types';
import { SOCIAL_LINKS } from '../constants';

interface CartModalProps {
    items: CartItem[];
    onClose: () => void;
    onUpdateQuantity: (itemId: string, newQuantity: number) => void;
}

const CartModal: React.FC<CartModalProps> = ({ items, onClose, onUpdateQuantity }) => {
    const [isVisible, setIsVisible] = useState(false);
    const modalContentRef = useRef<HTMLDivElement>(null);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(onClose, 200);
    }, [onClose]);
    
    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (modalContentRef.current && !modalContentRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClose]);

    const services = items.filter(item => item.type === 'service');
    const products = items.filter(item => item.type === 'product');
    
    const hasServices = services.length > 0;
    const hasProducts = products.length > 0;

    const productsSubtotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const servicesSubtotal = services.reduce((sum, item) => sum + item.price, 0);

    let discount = 0;
    const isDiscountApplied = hasServices && hasProducts;

    if (isDiscountApplied) {
        discount = Math.round(productsSubtotal * 0.10);
    }
    
    const subtotal = productsSubtotal + servicesSubtotal;
    const total = subtotal - discount;

    const handleOrderWhatsApp = () => {
        if (items.length === 0) return;

        let message = "🎉 НОВАЯ ЗАЯВКА С САЙТА! 🎉\n\nЗдравствуйте! Хочу оформить заявку:\n";
        
        if (services.length > 0) {
            const serviceDetails = services.map(item => 
                `· ${item.name} (${item.details}) - ${item.price.toLocaleString('ru-RU')} р.`
            ).join('\n');
            message += `\n🗓️ ЗАПИСЬ НА УСЛУГИ:\n${serviceDetails}\n`;
        }
        
        if (products.length > 0) {
            const productDetails = products.map(item => 
                `· ${item.name} (${item.details}) - ${item.quantity} шт. x ${item.price.toLocaleString('ru-RU')} р.`
            ).join('\n');
            message += `\n🛍️ ЗАКАЗ КОСМЕТИКИ:\n${productDetails}\n`;
        }
        
        message += `\nСумма: ${subtotal.toLocaleString('ru-RU')} р.`;
        if(isDiscountApplied) {
            message += `\nСкидка на уход (10%): -${discount.toLocaleString('ru-RU')} р.`;
        }
        message += `\nИтоговая сумма: ${total.toLocaleString('ru-RU')} р.\n\nПожалуйста, свяжитесь со мной для подтверждения.`;

        const encodedText = encodeURIComponent(message.trim());
        const whatsappUrl = `${SOCIAL_LINKS.whatsapp}?text=${encodedText}`;
        
        window.open(whatsappUrl, '_blank');
        handleClose();
    };

    return (
        <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div ref={modalContentRef} className={`bg-secondary w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col transform transition-all duration-300 text-text-main ${isVisible ? 'scale-100' : 'scale-95'}`} style={{maxHeight: '90vh'}}>
                <div className="flex justify-between items-center p-6 bg-surface">
                    <h2 className="font-heading text-2xl sm:text-3xl flex items-center">
                        <span className="fas fa-shopping-basket mr-3 text-accent" aria-hidden="true"></span>
                        Ваша корзина
                    </h2>
                    <button onClick={handleClose} className="text-3xl text-text-muted hover:text-red-500 transition-transform duration-200 transform hover:rotate-90">
                        <span className="fas fa-times" aria-hidden="true"></span>
                    </button>
                </div>
                <div className="p-6 sm:p-8 font-sans overflow-y-auto flex-grow">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-text-muted text-xl">Ваша корзина пуста.</p>
                            <a href="#services" onClick={handleClose} className="text-accent hover:underline mt-2 inline-block">Перейти к выбору услуг и ухода</a>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {services.length > 0 && (
                                <div>
                                    <h3 className="font-heading text-lg mb-2 text-accent">Услуги</h3>
                                    <div className="space-y-3">
                                        {services.map(item => (
                                            <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-primary rounded-lg">
                                                <div>
                                                    <p className="font-bold text-text-main">{item.name}</p>
                                                    <p className="text-sm text-text-muted">{item.details}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-accent font-semibold">{item.price.toLocaleString('ru-RU')} р.</p>
                                                    <button onClick={() => onUpdateQuantity(item.id, 0)} className="text-text-muted hover:text-red-500 transition-colors text-xl" aria-label={`Удалить ${item.name}`}>
                                                        <span className="fas fa-trash-alt" aria-hidden="true"></span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                             {products.length > 0 && (
                                <div>
                                     <h3 className="font-heading text-lg mb-2 text-accent">Домашний уход</h3>
                                    <div className="space-y-3">
                                        {products.map(item => (
                                            <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-primary rounded-lg">
                                                <div className="flex-grow">
                                                    <p className="font-bold text-text-main">{item.name}</p>
                                                    <p className="text-sm text-text-muted">{item.details}</p>
                                                    <p className="text-accent font-semibold mt-1">{item.price.toLocaleString('ru-RU')} р.</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-md bg-surface hover:bg-accent hover:text-text-on-accent transition-colors" aria-label={`Уменьшить количество ${item.name}`}>-</button>
                                                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                                                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-md bg-surface hover:bg-accent hover:text-text-on-accent transition-colors" aria-label={`Увеличить количество ${item.name}`}>+</button>
                                                </div>
                                                 <button onClick={() => onUpdateQuantity(item.id, 0)} className="text-text-muted hover:text-red-500 transition-colors text-xl ml-2" aria-label={`Удалить ${item.name}`}>
                                                    <span className="fas fa-trash-alt" aria-hidden="true"></span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {items.length > 0 && (
                    <div className="p-6 sm:p-8 border-t border-gray-700 bg-surface">
                        {hasProducts && !hasServices && (
                            <div className="text-center p-3 mb-4 bg-accent/10 rounded-lg animate-pulse">
                                <p className="text-accent font-semibold">
                                    <span className="fas fa-magic mr-2" aria-hidden="true"></span>
                                    Добавьте любую услугу, чтобы получить скидку 10% на весь домашний уход!
                                </p>
                            </div>
                        )}
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-lg">
                                <span>Сумма:</span>
                                <span>{subtotal.toLocaleString('ru-RU')} р.</span>
                            </div>
                            {isDiscountApplied && (
                                <div className="flex justify-between text-lg text-green-400">
                                    <span>Скидка на уход (10%):</span>
                                    <span>- {discount.toLocaleString('ru-RU')} р.</span>
                                </div>
                            )}
                            <div className="flex justify-between text-2xl font-bold text-accent pt-2 border-t border-gray-700 mt-2">
                                <span>ИТОГО:</span>
                                <span>{total.toLocaleString('ru-RU')} р.</span>
                            </div>
                        </div>

                        <button onClick={handleOrderWhatsApp} className="w-full rounded-lg bg-green-500 text-white px-6 py-4 text-base sm:text-lg font-semibold hover:bg-green-600 flex items-center justify-center space-x-3 transition-colors duration-300">
                            <span className="fab fa-whatsapp text-2xl" aria-hidden="true"></span>
                            <span>Оформить заявку в WhatsApp</span>
                        </button>
                        <p className="text-xs text-text-muted text-center mt-3">
                            Вы будете перенаправлены в WhatsApp для отправки готового сообщения с вашей заявкой.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartModal;