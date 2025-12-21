import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

document.addEventListener("DOMContentLoaded", function () {
    const carosuelimage = new Swiper('.carosuelimage-swiper', {
        slidesPerView: "auto",
        spaceBetween: 30,
        observer: true,
        autoplay:false,
        freeMode: true,



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