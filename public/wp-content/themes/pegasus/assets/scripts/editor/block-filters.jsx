if (typeof wp !== 'undefined') {
    const { createHigherOrderComponent } = wp.compose;
    const { InspectorControls } = wp.blockEditor;
    const { PanelBody, SelectControl } = wp.components;
    const { ToggleControl } = wp.components;

    wp.hooks.addFilter(
        'blocks.registerBlockType',
        'pegasus/button-block-modal-attr',
        settings => {
            // If the block isn't a `core/button` block, we return the same settings
            if (settings.name != 'core/button') {
                return settings;
            }

            // Else, we extend the attributes
            settings.attributes = {
                ...settings.attributes,
                openInModal: {
                    type: 'boolean',
                    default: '',
                },
                modalType: {
                    type: 'string',
                    default: '',
                },
                smoothScroll: {
                    type: 'boolean',
                    default: '',
                },
            };

            return settings;
        }
    );

    const withInspectorControls = createHigherOrderComponent((BlockEdit) => {
        return (props) => {
            const { name } = props;

            // If the block isn't a `core/button` block, we return an unmutated component
            if (name == 'core/button') {
                return <PegasusExtendedButtonBlock BlockEdit={BlockEdit} {...props} />;
            }

            if (name == 'core/group') {
                return <PegasusExtendedGroupBlock BlockEdit={BlockEdit} {...props} />;
            }

            // Else, we extend the component with controls to manipulate the new attribute.
            return <BlockEdit {...props} />;
        };
    }, 'withInspectorControl');

    const PegasusExtendedButtonBlock = (props) => {
        const { BlockEdit, setAttributes, attributes } = props;
        const openInModal = !!attributes.openInModal;
        const modalType = attributes.modalType || '';
        const smoothScroll = !!attributes.smoothScroll;

        return (
            <>
                <BlockEdit {...props} />
                <InspectorControls>
                    <PanelBody>
                        <ToggleControl
                            label="Open In Modal"
                            checked={openInModal}
                            onChange={() => setAttributes({ openInModal: !openInModal })}
                        />
                        {openInModal && (
                            <SelectControl
                                label="Modal Type"
                                value={modalType}
                                options={[
                                    { label: 'Select type...', value: '' },
                                    { label: 'Full', value: 'full' },
                                    { label: 'Video', value: 'video' },
                                ]}
                                onChange={(value) => setAttributes({ modalType: value })}
                            />
                        )}
                        <ToggleControl
                            label="Smooth Scroll"
                            checked={smoothScroll}
                            onChange={() => setAttributes({ smoothScroll: !smoothScroll })}
                        />
                    </PanelBody>
                </InspectorControls>
            </>
        )
    }

    wp.hooks.addFilter(
        'editor.BlockEdit',
        'pegasus/button-block-modal',
        withInspectorControls
    );

    wp.hooks.addFilter(
        'blocks.getSaveContent.extraProps',
        'pegasus/save-button-block-modal-attr',
        (props, blockType, attributes) => {
            if (blockType.name != 'core/button') {
                return props;
            }

            props.openInModal = !!attributes.openInModal;
            props.modalType = attributes.modalType || '';
            props.smoothScroll = !!attributes.smoothScroll;

            return props;
        }
    );

    wp.hooks.addFilter(
        'blocks.registerBlockType',
        'pegasus/group-block-transition-attr',
        settings => {
            // If the block isn't a `core/group` block, we return the same settings
            if (settings.name != 'core/group') {
                return settings;
            }

            // Else, we extend the attributes
            settings.attributes = {
                ...settings.attributes,
                loadTransition: {
                    type: 'boolean',
                    default: '',
                }
            };

            return settings;
        }
    );

    const PegasusExtendedGroupBlock = (props) => {
        const { BlockEdit, setAttributes, attributes } = props;
        const { loadTransition, id } = attributes;

        return (
            <>
                <BlockEdit {...props} />
                <InspectorControls>
                    <PanelBody>
                        <ToggleControl
                            label="Load Transition"
                            checked={loadTransition}
                            onChange={() => setAttributes({ loadTransition: !loadTransition })}
                        />
                    </PanelBody>
                </InspectorControls>
            </>
        )
    }

    wp.hooks.addFilter(
        'blocks.getSaveContent.extraProps',
        'pegasus/group-block-transition-attr',
        (props, blockType, attributes) => {
            const { loadTransition = false } = attributes;

            if (blockType.name != 'core/group') {
                return props;
            }

            props.loadTransition = loadTransition;

            return props;
        }
    );
}