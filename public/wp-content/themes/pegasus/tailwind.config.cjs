module.exports = {
    content: [
        "./**/*.php",
        "./framework/{**/*,*}.php",
        "./assets/{**/*,*}.scss",
        "./assets/{**/*,*}.svg",
        "./blocks/{**/*,*}.php",
        "./blocks/{**/*,*}.twig",
        "./blocks/{**/*,*}.js",
        "./blocks/{**/*,*}.json",
        "./views/{**/*,*}.twig",
        "./parts/{**/*,*}.twig",
        "./parts/{**/*,*}.json",
        "./parts/{**/*,*}.js",
        "./vendor/plug-and-play-design/{**/*,*}.php",
        "./vendor/plug-and-play-design/{**/*,*}.twig",
        "./vendor/plug-and-play-design/{**/*,*}.js",
        "./vendor/plug-and-play-design/{**/*,*}.json",
    ],
    theme: {
        /**
         * screens
         * Description: Set the desired breakpoints. Affects all sm:, md:, lg:, xl: and 2xl: class variants
         *              These sizes have been chosen to match the default WordPress breakpoints.
         */
        screens: {
            xs: "600px",
            sm: "782px",
            md: "960px",
            lg: "1080px",
            xl: "1280px",
            "2xl": "1440px",
            "3xl": "1640px",
        },

        container: {
            padding: {
                DEFAULT: "20px",
                xs: "20px",
                sm: "40px",
                md: "40px",
                lg: "40px",
                xl: "40px",
                "2xl": "20px",
                "3xl": "20px",
            },
            center: true,
        },

        /**
         * EXTEND
         */
        extend: {
            /**
             * fontFamily
             * Description: Set the font family for each text element.
             */
            fontFamily: {
                headings: ["var(--wp--preset--font-family--heading)"],
                body: ["var(--wp--preset--font-family--body)"],
            },

            fontSize: {
                xs: "var(--wp--preset--font-size--x-small)",
                sm: "var(--wp--preset--font-size--small)",
                md: "var(--wp--preset--font-size--medium)",
                lg: "var(--wp--preset--font-size--large)",
                xl: "var(--wp--preset--font-size--x-large)",
                '2xl': "var(--wp--preset--font-size--xx-large)",
                '3xl': "var(--wp--preset--font-size--xxx-large)",
                '4xl': "var(--wp--preset--font-size--xxxx-large)",
            },

            /**
             * colors
             * Description: Create additional colour classes.
             */
            colors: {
                "pale-01": "var(--wp--preset--color--pale-01)",
                "pale-02": "var(--wp--preset--color--pale-02)",
                "pale-03": "var(--wp--preset--color--pale-03)",
                "yellow-01": "var(--wp--preset--color--yellow-01)",
                "yellow-02": "var(--wp--preset--color--yellow-02)",
                "green-01": "var(--wp--preset--color--green-01)",
                "green-02": "var(--wp--preset--color--green-02)",
                "dark-01": "var(--wp--preset--color--dark-01)",
                "dark-02": "var(--wp--preset--color--dark-02)",
                "gray-01": "var(--wp--preset--color--gray-01)",
                "gray-02": "var(--wp--preset--color--gray-02)",
                mid: "var(--wp--preset--color--mid)",
                "mid-02": "var(--wp--preset--color--mid-02)",
                dark: "var(--wp--preset--color--dark)",
            },
            borderColor: {
                DEFAULT: "transparent",
            },
        },
    },
    corePlugins: {
        container: false
    },
    plugins: [
        function ({addComponents}) {
            addComponents({
                '.container': {
                    margin: '0 auto',
                    width: '100%',
                    padding: '0 20px',
                    '@screen sm': {
                        width: '94%',
                        padding: '0',
                    }
                }
            })
        },
        require("@tailwindcss/container-queries")
    ],
};
