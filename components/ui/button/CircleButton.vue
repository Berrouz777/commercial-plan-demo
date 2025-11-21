<template>
    <component
        :is="tag"
        :class="[classes, 'circle-button', {'cursor-pointer': !disabledCursorChange}]"
        :type="!tag ? type : ''"
        :disabled="disabled"
        @click="$emit('click', $event)"
    >
        <slot></slot>
    </component>
</template>

<script>
export default {
    name: 'CircleButton',

    props: {
        inverted: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        size: {
            type: String,
            default: '',
        },
        disabledCursorChange: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: 'button',
        },
        tag: {
            type: String,
            default: 'button',
        },
    },

    computed: {
        classes() {
            return [
                {
                    [`circle-button--${this.size}`]: this.size,
                    'is-inverted': this.inverted,
                    'is-disabled': this.disabled,
                },
            ];
        },
    },
};
</script>

<style lang="scss" scoped>
    .circle-button {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 8rem;
        height: 8rem;
        border-radius: 50%;
        border: 1px solid transparent;
        background: transparent;
        transition: border-color 0.3s, background-color 0.3s;

        &--small {
            height: 4.8rem;
            width: 4.8rem;
        }

        &.is-disabled {
            opacity: 0.4;
            pointer-events: none;
        }

        & > svg {
            width: 2.4rem;
            height: 2.4rem;
        }
    }
</style>

