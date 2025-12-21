import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

document.addEventListener("DOMContentLoaded", function () {
    const therapySwiper = new Swiper('.therapy-swiper', {
        slidesPerView: "auto",
        spaceBetween: 30,
        observer: true,
        autoplay: false,

        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
});

// popup
document.addEventListener("DOMContentLoaded", function () {
    // Pobieramy wszystkie ikony pytania
    const questionIcons = document.querySelectorAll('.question_icon');

    questionIcons.forEach(function(icon) {
        icon.addEventListener('click', function() {
            // Znajdujemy najbliższego rodzica z klasą .activity-info
            const activityInfo = icon.closest('.activity-info');
            if (activityInfo) {
                // Szukamy w obrębie tej aktywności elementu popup (bez względu na to, czy ma klasę closed czy nie)
                const popup = activityInfo.querySelector('.popup_desc_fz');
                if (popup) {
                    popup.classList.remove('closed');
                }
            }
        });
    });

    // Pobieramy wszystkie przyciski zamknięcia we wszystkich popupach
    const closeButtons = document.querySelectorAll('.popup_desc_fz__close');

    closeButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            // Znajdujemy najbliższy popup (rodzica o klasie .popup_desc_fz)
            const popup = btn.closest('.popup_desc_fz');
            if (popup) {
                popup.classList.add('closed');
            }
        });
    });
});
