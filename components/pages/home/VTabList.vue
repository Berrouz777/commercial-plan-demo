<template>
    <div
        :class="[$style.Tabs, classList]"
        class="v-tab-list"
    >
        <div
            v-for="(tab, index) in tabs"
            :key="index"
            :class="[$style.tab, 'cursor-pointer', {
                [$style._active]: tab.value === value,
            }]"
            class="v-tab-list__tab"
            @click="onTabClick(tab)"
        >
            {{ tab.name }}
        </div>
    </div>
</template>

<script>
export default {
    name: 'VTabList',

    props: {
        tabs: {
            type: Array,
            default: () => [],
        },
        value: {
            type: [String, Number],
            default: null,
        },
        view: {
            type: String,
            default: 'underline',
            validator: value => ['underline', 'button'].includes(value),
        },
    },

    computed: {
        classList() {
            return [{
                [this.$style[`_${this.view}`]]: this.view,
            }];
        },
    },

    methods: {
        onTabClick(tab) {
            this.$emit('click', tab.value);
        },
    },
};
</script>

<style lang="scss" module>
    .Tabs {
        display: flex;
        justify-content: center;

        &._button {
            width: max-content;

            .tab {
                padding: 1.1rem 2.4rem;
                border: 1px solid rgba(0, 0, 0, .12);
                line-height: 1.32;
                transition: border-color .3s ease-in-out, background-color .3s ease-in-out;

                &:not(:last-child) {
                    margin-right: .8rem;
                }

                &._active {
                    border-color: #fff;
                    background-color: #fff;
                }
            }
        }
    }

    .tab {
        position: relative;
        display: flex;
        align-items: center;
        color: #000;
        user-select: none;
    }
</style>

