<template>
    <li
        :class="[$style.VAccordionItem, classList]"
    >
        <div
            :class="$style.header"
            @click="toggle(!isOpen)"
        >

            <slot name="header"></slot>

        </div>

        <ExpandBlock>
            <div v-if="isOpen">
                <slot></slot>
            </div>
        </ExpandBlock>
    </li>
</template>

<script>
import ExpandBlock from '@/components/common/ExpandBlock';

export default {
    name: 'VAccordionItem',

    components: {
        ExpandBlock,
    },

    data() {
        return {
            isOpen: false,
        };
    },

    computed: {
        classList() {
            return [{
                [this.$style._expanded]: this.isOpen,
            }];
        },
    },

    beforeMount() {
        this.$parent.register(this);
    },

    beforeDestroy() {
        this.$parent.unregister(this);
    },

    methods: {
        toggle(value) {
            if (value !== this.isOpen) {
                this.isOpen = value;
                this.$parent.setOpen(this, this.isOpen);
            }
        },
    },
};
</script>

<style lang="scss" module>
    .VAccordionItem {
        position: relative;

        &._expanded {
            :global(.accordion-icon) {
                border: 1px solid $dark-main;
                background-color: $dark-main;
                color: $main-white;
            }
        }
    }
</style>

