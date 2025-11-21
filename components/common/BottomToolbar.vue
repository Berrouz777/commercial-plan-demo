<template>
    <div :class="[$style.BottomToolbar, classes]">
        <div :class="$style.row">
            <div :class="[$style.left, $style.cell]">
                <slot name="left"></slot>
                <div :class="$style.label">
                    <slot name="leftLabel"></slot>
                </div>
            </div>

            <div :class="[$style.right, $style.cell]">
                <div :class="$style.label">
                    <slot name="rightLabel"></slot>
                </div>
                <slot name="right"></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'BottomToolbar',

    props: {
        mobileLabelsVisible: {
            type: Boolean,
            default: false,
        },
        isCommercialPage: {
            type: Boolean,
            default: false,
        },
    },

    computed: {
        classes() {
            return {
                [this.$style['is-labels-visible']]: this.mobileLabelsVisible,
                [this.$style['is-commercial-page']]: this.isCommercialPage,
            };
        },
    },
};
</script>

<style lang="scss" module>
    .BottomToolbar {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-top: 1.6rem;
        padding-bottom: 3.2rem;
        user-select: none;

        &.is-commercial-page {
            padding-top: 1.2rem;
            padding-bottom: 1rem;

            .row {
                height: 4.8rem;
            }
        }
    }

    .row {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 8rem;
    }

    .cell {
        display: flex;
        align-items: center;
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: 0;
    }

    .left {
        .label {
            margin-left: 1.4rem;
        }
    }

    .right {
        justify-content: flex-end;

        .label {
            margin-right: 1.6rem;
        }
    }

    .label {
        font-size: 12px;
    }
</style>

