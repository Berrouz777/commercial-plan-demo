<template>
    <ul :class="$style.VAccordion">
        <!-- @slot Список компонентов VAccordionItem -->
        <slot></slot>
    </ul>
</template>

<script>
export default {
    name: 'VAccordion',

    props: {
        /**
         * Определяет возможность раскрывать несколько элементов одновременно
         */
        multiple: {
            type: Boolean,
            default: false,
        },

        /**
         * Определяет возможность закрывать все списки, кликая за пределы Аккордиона
         */
        clickOutSide: {
            type: Boolean,
            default: false,
        },

        /**
         * Определяет целевой тег за пределами Аккордиона, при клике по которому будут закрываться списки
         */
        targetTag: {
            type: String,
            default: '',
        },
    },

    data() {
        return {
            panels: [],
            open: null,
        };
    },

    mounted() {
        if (this.clickOutSide) {
            document.addEventListener('click', this.handleDocumentClick);
        }
    },

    beforeDestroy() {
        if (this.clickOutSide) {
            document.removeEventListener('click', this.handleDocumentClick);
        }
    },

    methods: {
        register(panel) {
            this.panels.push(panel);
        },

        unregister(panel) {
            if (!this.multiple && this.open === panel) {
                this.open = null;
            }

            const index = this.panels.findIndex(p => p._uid === panel._uid);
            this.panels.splice(index, 1);
        },

        setOpen(panel, isOpen) {
            if (!this.multiple) {
                for (let i = 0; i < this.panels.length; i++) {
                    const item = this.panels[i];
                    if (isOpen === true && item._uid !== panel._uid) {
                        item.toggle(false);
                    }
                }

                this.open = isOpen ? panel : null;
            }
        },

        closeAllPanels() {
            this.panels.forEach(panel => panel.toggle(false));
        },

        handleDocumentClick(e) {
            const isClickOutside = this.targetTag
                ? !this.$el.contains(e.target) && this.targetTag === e.target.tagName
                : !this.$el.contains(e.target);
            if (isClickOutside) {
                this.closeAllPanels();
            }
        },
    },
};
</script>

<style lang="scss" module>
    .VAccordion {
        position: relative;
        z-index: 1;
    }
</style>

