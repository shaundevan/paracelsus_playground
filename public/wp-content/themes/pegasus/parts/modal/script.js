import { pegasus } from "../../assets/scripts/global/01-pegasus";

/**
 * allModals
 *
 * Component code for creating all modals on the page
 *
 * 	Usage:
 * 	Add link with the attr 'data-pegasus-modal'.
 * 	Any values passed to the attr will be added as classes on the modal so it can be styled accordingly.
 * 	To include modal navigation, pass the class 'Modal--with-nav' to the data attr. This class will be picked up and the nav will be built.
 *
 * 	Example:
 *  <a href="#" data-pegasus-modal="Modal--team Modal--with-nav"></a>
 *
 * @since  2.0.0
 */
window.allModals = () => {
    return {
        init() {

            const modalSkeleton = pegasus.stringToHTML(
                document.getElementById("Modal__Skeleton").innerHTML
            );
            const modalLinks = this.createModalLinks(
                document.querySelectorAll("[data-pegasus-modal]")
            );

            modalLinks.forEach((link, index) => {
                const modal = modalSkeleton.cloneNode(true);

                let cssClass = "Modal",
                    modalNav;

                //check for classes to add
                if (link.dataset.pegasusModal.length) {
                    cssClass += " " + link.dataset.pegasusModal;

                    //if nav specified
                    if (link.dataset.pegasusModal.includes("Modal--with-nav")) {
                        modalNav = this.buildModalNav(index, modalLinks);

                        if (modalNav) {
                            modal
                                .querySelector(".Modal__navigation")
                                .append(modalNav);
                        }
                    }
                }

                //setup classes and id
                modal.className = cssClass;
                modal.id = link.dataset.pegasusModalId;

                //append modal template to page if it does nt already exist
                if (!document.getElementById(link.dataset.pegasusModalId)) {
                    document.body.append(modal);
                }
            });

            window.modal = this;
        },

        doesLinkAlreadyExist(link, linksArray) {
            return linksArray.find((element) => element.href === link.href);
        },

        createModalLinks(links) {

            const modalLinks = [];

            if (links.length) {
                links.forEach((link, index) => {
                    // Add ?modal=yes query string to url, so head and foot are removed from fetched page
                    const url = new URL(link.href);
                    // Use relative pathname instead of full URL to avoid CORS issues between www/non-www
                    const href = url.pathname + "?modal=yes" + url.hash;
                    link.href = href;

                    const existingLink = this.doesLinkAlreadyExist(
                        link,
                        modalLinks
                    );

                    //check for existing link and copy id if true
                    if (existingLink) {
                        link.setAttribute(
                            "data-pegasus-modal-id",
                            existingLink.dataset.pegasusModalId
                        );
                    } else {
                        link.setAttribute(
                            "data-pegasus-modal-id",
                            `modal-${index}`
                        );

                        this.loadModalContent(
                            link.href,
                            link.dataset.pegasusModalId
                        );
                    }

                    //add event to emit 'modalopen' event for specified modal
                    link.addEventListener("click", this.emitModalOpen);

                    //check we're not adding existing links.
                    if (!existingLink) modalLinks.push(link);
                });
            }

            return modalLinks;
        },

        emitModalOpen(e) {
            e.preventDefault();

            const modalID = e.currentTarget.dataset.pegasusModalId;
            const myEvent = new CustomEvent("modalopen", {
                detail: { modalID },
            });

            window.dispatchEvent(myEvent);
        },

        buildModalNav(currentIndex, allLinksArray) {

            let prevLinkHTML, nextLinkHTML;

            //check if we're at the start or end
            let prevLink =
                currentIndex > 0 ? allLinksArray[currentIndex - 1] : "";
            let nextLink =
                currentIndex < allLinksArray.length - 1
                    ? allLinksArray[currentIndex + 1]
                    : "";

            //check if links are modals with navs
            if (prevLink !== "")
                prevLink = prevLink.dataset.pegasusModal.includes(
                    "Modal--with-nav"
                )
                    ? prevLink
                    : "";
            if (nextLink !== "")
                nextLink = nextLink.dataset.pegasusModal.includes(
                    "Modal--with-nav"
                )
                    ? nextLink
                    : "";

            if (prevLink !== "") {
                const target = prevLink.dataset.pegasusModalId;
                const url = new URL(prevLink.href);
                // Use relative pathname instead of full URL to avoid CORS issues between www/non-www
                const href = url.pathname + "?modal=yes" + url.hash;

                prevLinkHTML = `<a href="${href}" class="prev-link arrow-btn" data-pegasus-modal-id="${target}"></a>`;
            } else {
                prevLinkHTML = `<span class="prev-link arrow-btn -disabled"></span>`;
            }

            if (nextLink !== "") {
                const target = nextLink.dataset.pegasusModalId;
                const url = new URL(nextLink.href);
                // Use relative pathname instead of full URL to avoid CORS issues between www/non-www
                const href = url.pathname + "?modal=yes" + url.hash;

                nextLinkHTML = `<a href="${href}" class="next-link arrow-btn" data-pegasus-modal-id="${target}"></a>`;
            } else {
                nextLinkHTML = `<span class="next-link arrow-btn -disabled"></span>`;
            }

            //create modalNav DOM element
            const modalNav = pegasus.stringToHTML(
                `<div class="links">${prevLinkHTML} ${nextLinkHTML}</div>`
            );

            //set up modal open and ajax events on modal nav links
            modalNav
                .querySelectorAll("[data-pegasus-modal-id]")
                .forEach((link) => {
                    link.addEventListener("click", this.emitModalOpen);

                    link.addEventListener("click", (e) => {
                        e.preventDefault();
                        this.loadModalContent(
                            link.href,
                            link.dataset.pegasusModalId
                        );
                    });
                });

            return modalNav;
        },

        loadModalContent(href, modalID) {
            pegasus
                .fetchContent(href)
                .then((resp) => {
                    if (!resp.ok) throw Error(resp.statusText);

                    console.log('loading modal content...');

                    return resp.text();
                })
                .then((htmlResponse) => {
                    const modalHTML = htmlResponse;

                    const modalBody = document.querySelector(
                        `#${modalID} .Modal__body`
                    );

                    modalBody.innerHTML = modalHTML;
                })
                .then(() => {
                    //reinit anything else here...

                    //reinit cf7 forms
                    if (typeof wpcf7 !== "undefined" && wpcf7 !== null) {
                        const cf7Forms = document.querySelectorAll(
                            `#${modalID} .wpcf7 > form`
                        );
                        if (cf7Forms.length)
                            cf7Forms.forEach((form) => wpcf7.init(form));
                    }
                })
                .catch((error) => {
                    console.error(error);

                    const modalBody = document.querySelector(
                            `#${modalID} .Modal__body`
                        ),
                        errorContainer =
                            modalBody.querySelector(".Modal__error");

                    if (
                        typeof errorContainer === "undefined" ||
                        errorContainer === null
                    )
                        return;

                    errorContainer.classList.remove("hidden");
                })
                .finally(() => {
                    if (document.lazyLoadInstance) {
                        document.lazyLoadInstance.update();
                    }

                    const modalBody = document.querySelector(
                        `#${modalID} .Modal__body`
                    );

                    if (modalBody.firstElementChild.classList.contains('Modal__Form')) {
                        document.body.classList.add("modal-form");
                    } else {
                        document.body.classList.remove("modal-form");
                    }

                    if (modalBody.firstElementChild.classList.contains('Modal__Position')) {
                        document.body.classList.add("modal-bottom-left");
                    } else {
                        document.body.classList.remove("modal-bottom-left");
                    }

                    window.dispatchEvent(new Event("resize"));

                    const script = document.querySelector(`#${modalID} .Form script`);

                    console.log('script', script);

                    if (script) {
                        const scriptContent = script.textContent;

                        const formId = this.getSubstringBetween(
                            scriptContent,
                            'formId: "',
                            '"'
                        );
                        const portalId = this.getSubstringBetween(
                            scriptContent,
                            'portalId: "',
                            '"'
                        );
                        const target = this.getSubstringBetween(
                            scriptContent,
                            'target: "',
                            '"'
                        );

                        // Load HubSpot script and create form only when script is ready
                        window.hubSpotLoader.load()
                            .then(hbspt => {
                                hbspt.forms.create({
                                    "portalId": portalId,
                                    "formId": formId,
                                    "target": target,
                                    "onFormSubmitted": function ($form) {
                                        $form.closest('.Hubspot_Form').querySelector('.Hubspot_Form--innerblocks').classList.add('hidden');
                                    }
                                });
                            })
                            .catch(error => {
                                console.error('Failed to load HubSpot:', error);
                            });
                    }
                });
        },
        getSubstringBetween(str, startDelimiter, endDelimiter) {
            // Find the start position of the substring
            const startIndex = str.indexOf(startDelimiter);
            if (startIndex === -1) {
                // If the start delimiter is not found, return an empty string or handle error
                return "";
            }

            // Find the end position of the substring
            const endIndex = str.indexOf(
                endDelimiter,
                startIndex + startDelimiter.length
            );
            if (endIndex === -1) {
                // If the end delimiter is not found, return an empty string or handle error
                return "";
            }

            // Extract the substring between the start and end delimiters
            const substring = str.substring(
                startIndex + startDelimiter.length,
                endIndex
            );

            return substring;
        },
    };
};

/**
 * singleModal
 *
 * Component code for a single modal
 *
 * @since  2.0.0
 */
window.singleModal = () => {
    return {
        open: false,

        handleModalOpen(evt) {
            //only run on actual modals, not skeleton
            if (this.$el.classList.contains("ModalSkeleton")) return;

            document.body.classList.add("modal-open");
            this.open = this.$el.id === evt.detail.modalID;
        },

        handleModalClose() {
            document.body.classList.remove("modal-open");
            this.open = false;
        },
    };
};
