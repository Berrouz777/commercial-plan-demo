<template>
    <button
        :class="[$style.DefaultButton, classes]"
        @click="$emit('click', $event)"
    >
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: 'DefaultButton',

    props: {
        size: {
            type: String,
            default: 'default',
            validator: val => ['default', 'small'].includes(val),
        },
    },

    computed: {
        classes() {
            return [
                this.$style[`_${this.size}`],
            ];
        },
    },
};
</script>

<style lang="scss" module>
    .DefaultButton {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1a1a1a;
        color: #fff;
        transition: background .3s ease-in-out;

        &._default {
            padding: 1.1rem 9.1rem;
        }

        &._small {
            padding: 1.1rem 5rem;
        }

        &:hover {
            background: rgba(26, 26, 26, .8);
        }
    }
</style>

