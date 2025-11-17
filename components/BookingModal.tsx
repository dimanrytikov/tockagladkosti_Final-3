import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ModalData } from '../types';
import { SOCIAL_LINKS } from '../constants';

interface BookingModalProps {
    data: ModalData;
    onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ data, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [errors, setErrors] = useState<{ name?: string; phone?: string; dateTime?: string }>({});
    const modalContentRef = useRef<HTMLDivElement>(null);
    const today = new Date().toISOString().split('T')[0];

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

    useEffect(() => {
        if (!date) {
            setErrors(prev => ({ ...prev, dateTime: undefined }));
            return;
        }

        // Create date object in a way that respects the user's local timezone
        const selectedDate = new Date(date + 'T00:00:00');
        const dayOfWeek = selectedDate.getDay(); // 0 for Sunday, 1 for Monday, etc.

        if (dayOfWeek === 0) { // Sunday
            setErrors(prev => ({ ...prev, dateTime: 'Воскресенье - выходной. Пожалуйста, выберите другой день.' }));
            setTime(''); // Reset time if Sunday is selected
        } else {
            setErrors(prev => ({ ...prev, dateTime: undefined }));
        }
    }, [date]);

    const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(/\D/g, '');
        if (input.length > 11) input = input.substring(0, 11);

        if (input.startsWith('7') || input.startsWith('8')) {
            input = input.slice(1);
        }

        let formatted = '';
        if (input.length > 0) {
            formatted = '+7 (';
            formatted += input.substring(0, 3);
        }
        if (input.length >= 4) {
            formatted += ') ' + input.substring(3, 6);
        }
        if (input.length >= 7) {
            formatted += '-' + input.substring(6, 8);
        }
        if (input.length >= 9) {
            formatted += '-' + input.substring(8, 10);
        }
        setPhone(formatted);
    };


    const validateForm = () => {
        const newErrors: { name?: string; phone?: string; dateTime?: string } = {};
        if (!name.trim()) {
            newErrors.name = 'Пожалуйста, введите имя.';
        }
        if (phone.replace(/\D/g, '').length < 11) {
            newErrors.phone = 'Пожалуйста, введите полный номер телефона.';
        }
        if (date) {
            const selectedDate = new Date(date + 'T00:00:00');
            const dayOfWeek = selectedDate.getDay();
            if (dayOfWeek === 0) {
                newErrors.dateTime = 'Воскресенье - выходной. Пожалуйста, выберите другой день.';
            }
       }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendWhatsApp = () => {
        if (!validateForm()) return;

        let message: string;

        if (data.name.includes('Подарочный сертификат')) {
            const priceText = typeof data.price === 'number' ? `${data.price.toLocaleString('ru-RU')} р.` : 'сумма не указана';
            message = `🎉 ЗАЯВКА НА ПОДАРОЧНЫЙ СЕРТИФИКАТ! 🎉\n\nКлиент: ${name}\nТелефон: ${phone}\n\nНоминал сертификата: ${priceText}\n\nПожалуйста, свяжитесь со мной для оформления.`;
        } else {
            let priceText: string;
            if (typeof data.price === 'number') {
                priceText = `${data.price.toLocaleString('ru-RU')} р.`;
            } else {
                priceText = data.price;
            }

            let serviceDetails = data.isComplex && data.zones
                ? "Выбранные зоны:\n" + data.zones.map(z => `· ${z}`).join('\n')
                : `Услуга: ${data.name}`;

            message = `🎉 НОВАЯ ЗАЯВКА С САЙТА! 🎉\n\nКлиент: ${name}\nТелефон: ${phone}\n\nЖелаемая Дата: ${date || 'Не указана'}\nЖелаемое Время: ${time || 'Не указано'}\n\n${serviceDetails}\n\nИтоговая сумма: ${priceText}\n\nПожалуйста, подтвердите запись.`;
        }
        
        const encodedText = encodeURIComponent(message.trim());
        const whatsappUrl = `${SOCIAL_LINKS.whatsapp}?text=${encodedText}`;
        
        window.open(whatsappUrl, '_blank');
        handleClose();
    };
    
    const priceDisplay = typeof data.price === 'number' ? `${data.price.toLocaleString('ru-RU')} р.` : data.price;
    const isDateInvalid = !!errors.dateTime;
    const isCertificate = data.name.includes('Подарочный сертификат');


    return (
        <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div ref={modalContentRef} className={`bg-secondary w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 text-text-main ${isVisible ? 'scale-100' : 'scale-95'}`}>
                <div className="flex justify-between items-center p-6 bg-surface">
                    <h2 className="font-heading text-2xl sm:text-3xl">Оформление заявки</h2>
                    <button onClick={handleClose} className="text-3xl text-text-muted hover:text-red-500 transition-transform duration-200 transform hover:rotate-90">
                        <span className="fas fa-times" aria-hidden="true"></span>
                    </button>
                </div>
                <div className="p-6 sm:p-8 font-sans">
                    <div>
                        <h3 className="font-heading text-xl mb-3">Детали заявки:</h3>
                        <div className="text-text-main space-y-1 mb-4">
                            {data.isComplex && data.zones ? (
                                data.zones.map((zone) => <p key={zone} className="font-medium">· {zone}</p>)
                            ) : (
                                <p className="font-bold">{data.name}</p>
                            )}
                            {data.name === 'Общая запись (без процедуры)' && <p className="text-sm text-text-muted">Пожалуйста, укажите желаемую услугу в WhatsApp.</p>}
                        </div>
                        <div className="flex justify-between text-xl font-bold text-accent pt-3 border-t border-gray-700">
                            <span>{isCertificate ? 'Номинал:' : 'ИТОГО:'}</span>
                            <span>{priceDisplay}</span>
                        </div>
                    </div>
                    <div className="mt-8">
                        <h3 className="font-heading text-xl mb-4">Ваши Данные:</h3>
                        <form className="space-y-4" noValidate>
                            <div>
                                <label htmlFor="user-name" className="block text-sm font-medium text-text-muted mb-1">Ваше имя*</label>
                                <input type="text" id="user-name" value={name} onChange={e => setName(e.target.value)} autoFocus className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-primary placeholder:text-text-muted ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-accent focus:ring-accent'}`} required autoComplete="name" />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="user-phone" className="block text-sm font-medium text-text-muted mb-1">Ваш телефон*</label>
                                <input type="tel" id="user-phone" value={phone} onChange={handlePhoneInputChange} placeholder="+7 (999) 123-45-67" className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-primary placeholder:text-text-muted ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-accent focus:ring-accent'}`} required autoComplete="tel" />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                            {!isCertificate && (
                                <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="user-date" className="block text-sm font-medium text-text-muted mb-1">Удобная Дата</label>
                                        <input 
                                            type="date" 
                                            id="user-date" 
                                            value={date} 
                                            min={today}
                                            onChange={e => setDate(e.target.value)} 
                                            required={false} 
                                            className={`w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 bg-primary ${isDateInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-accent'}`} />
                                    </div>
                                    <div>
                                        <label htmlFor="user-time" className="block text-sm font-medium text-text-muted mb-1">Удобное Время</label>
                                        <input 
                                            type="time" 
                                            id="user-time" 
                                            value={time}
                                            min="09:00"
                                            max="20:00"
                                            disabled={isDateInvalid}
                                            onChange={e => setTime(e.target.value)} 
                                            className="w-full p-3 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent bg-primary disabled:bg-surface/50 disabled:cursor-not-allowed" />
                                    </div>
                                </div>
                                {isDateInvalid && <p className="text-red-500 text-sm mt-2 text-center">{errors.dateTime}</p>}
                                </>
                            )}
                        </form>
                    </div>
                    <div className="mt-8">
                        <button 
                            onClick={handleSendWhatsApp}
                            disabled={isDateInvalid}
                            className={`w-full rounded-lg bg-green-500 text-white px-6 py-4 text-base sm:text-lg font-semibold hover:bg-green-600 flex items-center justify-center space-x-3 disabled:bg-green-500/50 disabled:cursor-not-allowed disabled:hover:bg-green-500/50 transition-colors duration-300`}
                        >
                            <span className="fab fa-whatsapp text-2xl" aria-hidden="true"></span>
                            <span>Отправить Заявку в WhatsApp</span>
                        </button>
                        <p className="text-xs text-text-muted text-center mt-3">
                            Нажимая кнопку, вы будете перенаправлены в WhatsApp для отправки готового сообщения.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};